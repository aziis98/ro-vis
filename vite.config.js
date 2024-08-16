import { defineConfig } from 'vite'

import wasm from 'vite-plugin-wasm'
import preactPlugin from '@preact/preset-vite'

export default defineConfig({
    build: {
        outDir: 'out',
        emptyOutDir: true,
    },
    server: {
        port: 3000,
    },
    plugins: [preactPlugin(), wasm()],
})
