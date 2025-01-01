import { init, register, locale, getLocaleFromNavigator, t } from 'svelte-i18n';
register('english', () => import('./locales/english.json'));
register('hindi', () => import('./locales/hindi.json'));
register('assamese', () => import('./locales/assamese.json'));

init({
	fallbackLocale: 'english',
	initialLocale: getLocaleFromNavigator() || 'english'
});

export { locale, t };
