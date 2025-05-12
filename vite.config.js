import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
// import basicSsl from '@vitejs/plugin-basic-ssl';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    commonjs(),
    nodePolyfills({
      include: ['crypto', 'stream', 'buffer'],
      // globals: {
      //   process: true, // Polyfill process
      // },
      // protocolImports: true,
    }),
  ],
  base: '/',
  build: {
    sourcemap: false,
  },
  server: {
    historyApiFallback: true,
    port: 5177,
    proxy: {
      '/api': {
        // target: 'https://hidex.ai',
        target: 'https://test.hidex.pro',
        changeOrigin: true,
      },
      '/solana_new': {
        target: 'https://test.hidex.pro',
        changeOrigin: true,
      },
      '/pumpApi': {
        target: 'https://test.hidex.pro',
        changeOrigin: true,
      },
      '/gmgn': {
        target: 'https://test.hidex.pro',
        changeOrigin: true,
      },
    },
  },
  define: {
    process: {
      browser: true,
      version: 'browser',
      global: 'window',
    },
    global: 'window',
  },
  resolve: {
    alias: {
      '@': '/src',
      crypto: 'crypto-browserify',
      process: 'process/browser',
      buffer: 'buffer',
      stream: 'stream-browserify',
      'hidex-sdk': process.env.NODE_ENV === 'development' ? './hidex-sdk' : './hidex-sdk',
    },
  },
});
