import type { Post } from './posts';

/** Topic → kanji. First match wins, checked against tags then categories. */
const TOPICS: [RegExp, string, string][] = [
  [/proxmox|vm\b|virtual|lxc|passthrough/, '仮', 'virtual'],
  [/docker|container|kubernetes|k8s/, '箱', 'container'],
  [/home-?server|nas|server|dokku|ci|cd|deploy/, '鯖', 'server'],
  [/wsl|windows|atlas|powertoys|onedrive/, '窓', 'windows'],
  [/linux|debian|systemd|fish|shell|ssh|remote/, '核', 'kernel'],
  [/esphome|home-?assistant|smarthome|presence|iot|esp/, '宅', 'home'],
  [/3d|print|flashforge|filament|diy|hardware|arduino|keyboard|streamdeck/, '作', 'make'],
  [/gaming|steam|cyberpunk|watch-dogs|game|release/, '遊', 'play'],
  [/learn|study|productivity|university/, '学', 'learn'],
  [/rust|typescript|vscode|development|plugin|code|qt|project/, '組', 'build'],
  [/android|lineage|adb|phone/, '機', 'device'],
  [/sync|share|resilio|network|net/, '繋', 'connect'],
  [/travel|ticket|austria|train/, '旅', 'travel'],
  [/benchmark|arm|raspberry|sbc|cpu|gpu|llm/, '芯', 'chip'],
];

export function kanjiFor(post: Post): { kanji: string; meaning: string } {
  if (post.data.kanji) return { kanji: post.data.kanji, meaning: '' };
  const hay = [...post.data.tags, ...post.data.categories, post.id].join(' ').toLowerCase();
  for (const [re, kanji, meaning] of TOPICS) if (re.test(hay)) return { kanji, meaning };
  return { kanji: '記', meaning: 'note' };
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Traditional Japanese colour names, used as the cover tint. */
export const TINTS = [
  { name: 'shu', hex: '#d9432f' },      // 朱 vermilion
  { name: 'ai', hex: '#2f4f9e' },       // 藍 indigo
  { name: 'matsuba', hex: '#2e6b4f' },  // 松葉 pine
  { name: 'yamabuki', hex: '#c9861b' }, // 山吹 gold
  { name: 'kon', hex: '#1d2a54' },      // 紺 navy
  { name: 'murasaki', hex: '#6b3f8c' }, // 紫 purple
];
export const PATTERNS = ['seigaiha', 'asanoha', 'shippo', 'kikko', 'sayagata', 'stripes'] as const;
export type Pattern = (typeof PATTERNS)[number];

export function coverStyle(post: Post): { tint: (typeof TINTS)[number]; pattern: Pattern } {
  const h = hash(post.id);
  return { tint: TINTS[h % TINTS.length], pattern: PATTERNS[(h >>> 8) % PATTERNS.length] };
}
