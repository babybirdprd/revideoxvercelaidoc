import {defineConfig} from 'vite';
import motionCanvas from '@revideo/vite-plugin';

export default defineConfig({
	plugins: [motionCanvas()],
	build: {
		rollupOptions: {
			input: {
				main: './revideo/project.ts',
			},
		},
	},
	esbuild: {
		jsx: 'automatic',
		jsxImportSource: '@revideo/2d',
	},
});