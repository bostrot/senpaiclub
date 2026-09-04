import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 700 | 800 }[]> | undefined;

function loadFonts() {
  fonts ??= Promise.all([
    readFile(require.resolve('@fontsource/inter/files/inter-latin-400-normal.woff')).then((data) => ({ name: 'Inter', data, weight: 400 as const })),
    readFile(require.resolve('@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff')).then((data) => ({ name: 'Space Grotesk', data, weight: 700 as const })),
    readFile(require.resolve('@fontsource/shippori-mincho/files/shippori-mincho-japanese-800-normal.woff')).then((data) => ({ name: 'Shippori Mincho', data, weight: 800 as const })),
  ]);
  return fonts;
}

export interface OgOpts { title: string; subtitle?: string; meta?: string; kanji?: string; tint?: string; }

export async function ogImage({ title, subtitle, meta, kanji = '先輩', tint = '#d9432f' }: OgOpts): Promise<Buffer> {
  const size = title.length > 70 ? 46 : title.length > 40 ? 56 : 66;
  const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });
  const svg = await satori(
    el('div', { width: '100%', height: '100%', display: 'flex', background: '#0d0f13', color: '#eceef2', fontFamily: 'Inter', position: 'relative' }, [
      // right panel: kanji card
      el('div', { position: 'absolute', right: 0, top: 0, width: 420, height: 630, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${tint}33, ${tint}0d)`, borderLeft: `1px solid ${tint}55` }, [
        el('div', { fontFamily: 'Shippori Mincho', fontWeight: 800, fontSize: 300, color: tint, lineHeight: 1 }, kanji),
      ]),
      // left content
      el('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 780, height: '100%', padding: '60px 64px' }, [
        el('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
          el('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 7, background: '#d9432f', color: '#fff', fontFamily: 'Shippori Mincho', fontWeight: 800, fontSize: 18, lineHeight: 1 }, '先輩'),
          el('div', { fontSize: 26, fontWeight: 700, fontFamily: 'Space Grotesk' }, 'Senpai Club'),
          subtitle ? el('div', { color: '#8a8f9c', fontSize: 22, marginLeft: 6 }, `/ ${subtitle}`) : null,
        ].filter(Boolean)),
        el('div', { display: 'flex', flexDirection: 'column', gap: 22 }, [
          el('div', { fontSize: size, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em', fontFamily: 'Space Grotesk' }, title),
          meta ? el('div', { fontSize: 24, color: '#a1a7b4' }, meta) : null,
        ].filter(Boolean)),
        el('div', { display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#6b7180' }, [
          el('div', {}, 'senpai.club'),
          el('div', { fontFamily: 'Shippori Mincho', fontWeight: 800, letterSpacing: 6 }, '読む・学ぶ・作る'),
        ]),
      ]),
    ]),
    { width: 1200, height: 630, fonts: await loadFonts() },
  );
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
