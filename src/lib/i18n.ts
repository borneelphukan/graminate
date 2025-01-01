import { init, register, locale, t } from 'svelte-i18n';

register('english', () => import('./locales/english.json'));
register('hindi', () => import('./locales/hindi.json'));
register('assamese', () => import('./locales/assamese.json'));

let savedLocale = 'english';
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
	savedLocale = localStorage.getItem('locale') || 'english';
}

(async () => {
	await init({
		fallbackLocale: 'english',
		initialLocale: savedLocale
	});
	locale.set(savedLocale);
})();

export { locale, t };
