import { writable } from 'svelte/store';

export const temperatureScale = writable<'Celsius' | 'Fahrenheit'>('Celsius');
