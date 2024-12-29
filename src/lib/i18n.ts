import { init, register, locale } from 'svelte-i18n';

// Register your translation files
register('english', () => import('./locales/english.json'));
register('hindi', () => import('./locales/hindi.json'));
register('assamese', () => import('./locales/assamese.json'));

// Initialize i18n
init({
	fallbackLocale: 'english', // Match the registered key for English
	initialLocale: 'english' // Set the default locale to English
});

export { locale };
