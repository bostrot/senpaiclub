export const SITE = {
  title: 'Senpai Club',
  tagline: 'Read. Learn. Create.',
  description:
    'Hands-on guides and write-ups about home labs, Linux, Windows, WSL, Proxmox, 3D printing and everything in between.',
  url: 'https://senpai.club',
  lang: 'en',
  author: 'Eric Trenkel',
  email: 'blog@bostrot.com',
  github: 'https://github.com/bostrot',
  repo: 'https://github.com/bostrot/senpaiclub',
  linkedin: 'https://www.linkedin.com/in/erictrenkel',
  homepage: 'https://erictrenkel.com',
  postsPerPage: 12,
  giscus: {
    repo: 'bostrot/senpaiclub',
    repoId: 'R_kgDOJQO-xQ',
    category: 'Announcements',
    categoryId: 'DIC_kwDOJQO-xc4CVZk-',
    mapping: 'title',
  },
  newsletter: {
    action:
      'https://club.us21.list-manage.com/subscribe/post?u=738fc47653d1c9100e0ed1ad7&id=633fdaceaa&f_id=00f0a8e1f0',
    honeypot: 'b_738fc47653d1c9100e0ed1ad7_633fdaceaa',
    tag: '450962',
  },
} as const;

export const AUTHORS: Record<string, { name: string; url?: string; bio: string; initials: string }> = {
  eric: {
    name: 'Eric Trenkel',
    url: 'https://erictrenkel.com',
    bio: 'Computer scientist from Germany. Builds home-lab things, WSL tooling and the occasional 3D-printer mod.',
    initials: 'ET',
  },
  max: {
    name: 'Maximilian Maerkl',
    url: 'https://maxmaerkl.myportfolio.com/',
    bio: 'Tech enthusiast, travel addict and EMT. Writes about games, learning and life between Europe and Asia.',
    initials: 'MM',
  },
};

export const CATEGORY_LABELS: Record<string, string> = {
  wiki: 'Guide',
  tutorial: 'Tutorial',
  blog: 'Blog',
};
