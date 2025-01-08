import { writable } from 'svelte/store';

const initialScale =
	typeof window !== 'undefined' && localStorage.getItem('temperatureScale')
		? (localStorage.getItem('temperatureScale') as 'Celsius' | 'Fahrenheit')
		: 'Celsius';

export const temperatureScale = writable<'Celsius' | 'Fahrenheit'>(initialScale);

// Sync with localStorage whenever the scale changes
temperatureScale.subscribe((value) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem('temperatureScale', value);
	}
});
