import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 700 }[]> | undefined;

function loadFonts() {
  fonts ??= Promise.all([
    readFile(require.resolve('@fontsource/inter/files/inter-latin-400-normal.woff')).then((data) => ({ name: 'Inter', data, weight: 400 as const })),
    readFile(require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff')).then((data) => ({ name: 'Inter', data, weight: 700 as const })),
  ]);
  return fonts;
}

export interface OgOpts { title: string; subtitle?: string; meta?: string; }

/** Social preview card: the title in black on off-white, nothing else competing with it. */
export async function ogImage({ title, subtitle, meta }: OgOpts): Promise<Buffer> {
  const size = title.length > 70 ? 52 : title.length > 40 ? 62 : 72;
  const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });
  const svg = await satori(
    el('div', { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', background: '#fcfcfa', color: '#1c1c1a', fontFamily: 'Inter' }, [
      el('div', { display: 'flex', fontSize: 28, fontWeight: 700 }, subtitle ? `Senpai Club  ·  ${subtitle}` : 'Senpai Club'),
      el('div', { display: 'flex', flexDirection: 'column', gap: 28 }, [
        el('div', { fontSize: size, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' }, title),
        meta ? el('div', { fontSize: 28, color: '#5c5c58' }, meta) : null,
      ].filter(Boolean)),
      el('div', { display: 'flex', fontSize: 24, color: '#8a8a85', borderTop: '2px solid #e2e2dc', paddingTop: 24 }, 'senpai.club'),
    ]),
    { width: 1200, height: 630, fonts: await loadFonts() },
  );
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
