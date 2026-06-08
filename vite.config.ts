import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      insertTypesEntry: true,
      copyDtsFiles: true,
      beforeWriteFile: (filePath) => {
        if (filePath.endsWith('vite.config.d.ts')) {
          return false
        }
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style',
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@base-ui/react/merge-props',
        '@base-ui/react/use-render',
        '@floating-ui/react',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-popover',
        'class-variance-authority',
        'lodash.throttle',
        'react-hotkeys-hook',
        /^@tiptap\//,
      ],
    },
  },
})
