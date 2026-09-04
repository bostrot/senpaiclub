# senpai.club

Source for [senpai.club](https://senpai.club), built with [Astro](https://astro.build).

## Writing

Posts live in `src/content/posts/` as Markdown files named `YYYY-MM-DD-slug.md`. The date prefix is stripped from the URL, so `2026-05-03-atlas-os-on-windows.md` becomes `/atlas-os-on-windows/`.

```yaml
---
title: "My post"
date: 2026-05-03T19:00:00.000Z
author: eric            # eric | max (see src/data/site.ts)
description: "One or two sentences for cards, search and social previews."
categories: [wiki]      # wiki (shown as Guide), tutorial, blog
tags: [proxmox, windows]
image: /assets/uploads/cover.png   # optional
featured: false         # pin to the top of the home page
draft: false            # drafts render in dev only
---
```

Images go in `public/assets/uploads/` and are referenced as `/assets/uploads/file.png`. Code blocks support a title and line markers, e.g. ```` ```bash title="install.sh" {2-3} ````.

A browser editor ([Sveltia CMS](https://sveltiacms.app), GitLab login) is available at `/admin/`.

## Development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/ (also builds the search index)
npm run preview
```

Node 22+ is required. Deployment to GitHub Pages happens automatically on push to `main`.

## Features

- Static Astro site, no client framework; fonts self-hosted, no analytics
- Light/dark theme, view transitions, prefetching
- Full-text search (Pagefind, `⌘K`)
- Table of contents with scroll-spy, reading time, "Updated" dates from git history
- Code blocks with copy button, titles, line numbers and highlighting (Expressive Code)
- Generated Open Graph images per post, RSS at `/feed.xml`, sitemap, JSON-LD
- giscus comments, Mailchimp newsletter, related and adjacent posts
