import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			'@ui': 'src/components/ui',
			'@forms': 'src/components/forms',
			'@tables': 'src/components/tables',
			'@cards': 'src/components/cards',
			'@layout': 'src/components/layout',
			'@modals': 'src/components/modals',
			'@others': 'src/components/others',
			'@lib': 'src/lib',
			'@icons': 'src/icons'
		}
	}
};

export default config;
