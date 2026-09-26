// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://getpianoplay.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  devToolbar: { enabled: false },
});
