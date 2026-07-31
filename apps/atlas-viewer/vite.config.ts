import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force a single copy of React and Three.js across the monorepo source tree
    dedupe: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
    alias: [
      // Point all @atlas/* packages to their TypeScript source so Vite
      // can tree-shake and handle ESM properly, bypassing the CJS dist.
      { find: '@atlas/runtime',               replacement: path.resolve(__dirname, '../../packages/atlas-runtime/src/index.ts') },
      { find: '@atlas/renderer-core',         replacement: path.resolve(__dirname, '../../packages/renderer-core/src/index.ts') },
      { find: '@atlas/renderer-three-adapter',replacement: path.resolve(__dirname, '../../packages/renderer-three-adapter/src/index.ts') },
      { find: '@atlas/kernel',                replacement: path.resolve(__dirname, '../../packages/atlas-kernel/src/index.ts') },
      { find: '@atlas/types',                 replacement: path.resolve(__dirname, '../../packages/atlas-types/src/index.ts') },
      { find: '@atlas/parametric-engine',     replacement: path.resolve(__dirname, '../../packages/parametric-engine/src/index.ts') },
      { find: '@atlas/spatial-engine',        replacement: path.resolve(__dirname, '../../packages/spatial-engine/src/index.ts') },
      { find: '@atlas/geometry-engine',       replacement: path.resolve(__dirname, '../../packages/geometry-engine/src/index.ts') },
      { find: '@atlas/geometry-core',         replacement: path.resolve(__dirname, '../../packages/geometry-core/src/index.ts') },
      { find: '@atlas/assembly-engine',       replacement: path.resolve(__dirname, '../../packages/assembly-engine/src/index.ts') },
      { find: '@atlas/manufacturing-engine',  replacement: path.resolve(__dirname, '../../packages/manufacturing-engine/src/index.ts') },
      { find: '@atlas/document-engine',       replacement: path.resolve(__dirname, '../../packages/document-engine/src/index.ts') },
      { find: '@atlas/deliverables-engine',   replacement: path.resolve(__dirname, '../../packages/deliverables-engine/src/index.ts') },
      { find: '@atlas/cost-engine',           replacement: path.resolve(__dirname, '../../packages/cost-engine/src/index.ts') },
      { find: '@atlas/material-engine',       replacement: path.resolve(__dirname, '../../packages/material-engine/src/index.ts') },
      { find: '@atlas/rules-engine',          replacement: path.resolve(__dirname, '../../packages/rules-engine/src/index.ts') },
      // Stub out Node.js 'fs' for browser compatibility (used by ProjectLoader in CLI context only)
      { find: 'fs', replacement: path.resolve(__dirname, 'src/stubs/fs-stub.ts') },
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
