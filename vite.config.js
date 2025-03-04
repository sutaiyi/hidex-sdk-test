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
		}),
	],
	base: '/',
	build: {
		sourcemap: false,
	},
	server: {
		historyApiFallback: true,
		proxy: {
			'/api': {
				target: 'https://hidex.open.name',
				changeOrigin: true,
			},
			'/solana_new': {
				target: 'https://hidex.open.name',
				changeOrigin: true,
			},
			'/pumpApi': {
				target: 'https://hidex.open.name',
				changeOrigin: true,
			},
			'/gmgn': {
				target: 'https://hidex.open.name',
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
		},
	},
})
