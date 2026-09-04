import { getCollection, type CollectionEntry } from 'astro:content';
import { execSync } from 'node:child_process';
import readingTime from 'reading-time';

export type Post = CollectionEntry<'posts'>;

const modCache = new Map<string, Date | undefined>();

/**
 * Last meaningful edit of a post, following renames. Ignores the creation commit and
 * bulk commits (site migrations, mass reformatting) that touched many posts at once.
 */
export function lastModified(post: Post): Date | undefined {
  const file = post.filePath;
  if (!file) return undefined;
  if (modCache.has(file)) return modCache.get(file);
  let result: Date | undefined;
  try {
    const git = (cmd: string) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const commits = git(`git log --follow --format=%H%x09%cI -- "${file}"`).split('\n').filter(Boolean).map((l) => l.split('\t'));
    // drop the creation commit
    commits.pop();
    for (const [hash, iso] of commits) {
      const touched = git(`git diff-tree --no-commit-id --name-only -r ${hash}`).split('\n').filter((f) => /posts\//.test(f)).length;
      if (touched > 3) continue;
      const d = new Date(iso);
      if (d.getTime() - post.data.date.getTime() > 24 * 3600 * 1000) result = d;
      break;
    }
  } catch {
    /* not a git checkout */
  }
  modCache.set(file, result);
  return result;
}

export function readTime(post: Post): { minutes: number; words: number } {
  const stats = readingTime(post.body ?? '');
  return { minutes: Math.max(1, Math.round(stats.minutes)), words: stats.words };
}

/** Short plain-text summary derived from the first meaningful paragraph. */
export function excerpt(post: Post, max = 180): string {
  if (post.data.description) return post.data.description;
  const body = (post.body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s.*$/gm, ' ')
    .replace(/^\s*(?:[-*+]|\d+\.)\s.*$/gm, ' ')
    .replace(/^\s*\|.*$/gm, ' ')
    .replace(/^>\s?/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (body.length <= max) return body;
  const cut = body.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.]$/, '') + '…';
}

/** First image used in the post body, if any (used for cards and OG fallback). */
export function firstImage(post: Post): string | undefined {
  if (post.data.image) return post.data.image;
  const body = post.body ?? '';
  const md = body.match(/!\[[^\]]*\]\((\/[^)\s]+)/);
  if (md) return md[1];
  const html = body.match(/<img[^>]+src="(\/[^"]+)"/);
  if (html) return html[1];
  return undefined;
}

export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function countBy(posts: Post[], key: 'tags' | 'categories'): { name: string; slug: string; count: number }[] {
  const map = new Map<string, { name: string; count: number }>();
  for (const p of posts) {
    for (const t of p.data[key]) {
      const s = slugify(t);
      const cur = map.get(s);
      if (cur) cur.count++;
      else map.set(s, { name: t, count: 1 });
    }
  }
  return [...map.entries()]
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function related(post: Post, all: Post[], n = 3): Post[] {
  const tags = new Set(post.data.tags.map(slugify));
  return all
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, score: p.data.tags.filter((t) => tags.has(slugify(t))).length + (p.data.categories[0] === post.data.categories[0] ? 0.5 : 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.date.getTime() - a.p.data.date.getTime())
    .slice(0, n)
    .map((x) => x.p);
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Europe/Berlin' });
