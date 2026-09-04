import type { APIRoute } from 'astro';
import { fmtDate, getPosts, readTime } from '../../lib/posts';
import { AUTHORS, CATEGORY_LABELS, SITE } from '../../data/site';
import { ogImage, type OgOpts } from '../../lib/og';
import { coverStyle, kanjiFor } from '../../lib/kanji';

export async function getStaticPaths() {
  const posts = await getPosts();
  return [
    { params: { slug: 'default' }, props: { title: SITE.description, meta: undefined, subtitle: undefined } },
    ...posts.map((p) => ({
      params: { slug: p.id },
      props: {
        title: p.data.title,
        subtitle: p.data.categories[0] ? (CATEGORY_LABELS[p.data.categories[0]] ?? p.data.categories[0]) : undefined,
        meta: [AUTHORS[p.data.author]?.name, fmtDate(p.data.date), `${readTime(p).minutes} min read`].filter(Boolean).join('  ·  '),
        kanji: kanjiFor(p).kanji,
        tint: coverStyle(p).tint.hex,
      },
    })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const png = await ogImage(props as OgOpts);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
