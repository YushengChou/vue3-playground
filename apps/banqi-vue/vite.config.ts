import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'
import { fileURLToPath, URL } from 'node:url'

const rootSource = fileURLToPath(new URL('../../src', import.meta.url))
export default defineConfig(({ mode }) => ({
  base: mode === 'capacitor' ? './' : '/',
  envDir: fileURLToPath(new URL('../..', import.meta.url)),
  plugins: [vue(), AutoImport({ imports: ['vue'], dirs: ['src/composables'], vueTemplate: true }), UnoCSS({ configFile: fileURLToPath(new URL('../../uno.config.ts', import.meta.url)) })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)), '@game': rootSource } },
  server: { fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] } },
}))
