import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { excerpt, getPosts } from '../lib/posts';
import { SITE } from '../data/site';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    trailingSlash: true,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: excerpt(p, 300),
      link: `/${p.id}/`,
      categories: [...p.data.categories, ...p.data.tags],
    })),
    customData: `<language>${SITE.lang}</language>`,
  });
}
