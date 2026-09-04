// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

export default defineConfig({
  site: 'https://senpai.club',
  trailingSlash: 'always',
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  redirects: {
    '/benchmarking_arm/': '/benchmarking-arm/',
    '/part-2-create-a-rust-project-with-vscode-copy/': '/part-2-create-a-rust-project-with-vscode/',
  },
  integrations: [
    expressiveCode({
      themes: ['github-dark-default', 'github-light-default'],
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      useDarkModeMediaQuery: false,
      plugins: [pluginLineNumbers()],
      defaultProps: {
        showLineNumbers: false,
        overridesByLang: { 'bash,sh,shell,fish,zsh,console,powershell,ps1': { showLineNumbers: false } },
      },
      styleOverrides: {
        borderRadius: '0.75rem',
        borderColor: 'var(--border)',
        codeFontFamily: 'var(--font-mono)',
        codeFontSize: '0.875rem',
        codeLineHeight: '1.7',
        uiFontFamily: 'var(--font-sans)',
        frames: {
          shadowColor: 'transparent',
          editorTabBarBackground: 'var(--bg-subtle)',
          terminalTitlebarBackground: 'var(--bg-subtle)',
          terminalBackground: 'var(--code-bg)',
          editorBackground: 'var(--code-bg)',
        },
      },
    }),
    sitemap(),
  ],
  markdown: {
    shikiConfig: { themes: { light: 'github-light-default', dark: 'github-dark-default' } },
  },
  build: { inlineStylesheets: 'auto' },
});
