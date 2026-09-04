import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.md',
    base: './src/content/posts',
    // Strip the Jekyll-style date prefix so ids (and therefore URLs) stay `/my-post/`.
    generateId: ({ entry }) =>
      entry
        .replace(/\.md$/, '')
        .replace(/^\d{4}-\d{2}-\d{2}-/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().default('eric'),
    description: z.string().optional(),
    image: z.string().optional(),
    kanji: z.string().max(2).optional(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    layout: z.string().optional(),
    comments: z.boolean().default(true),
  }),
});

export const collections = { posts };
