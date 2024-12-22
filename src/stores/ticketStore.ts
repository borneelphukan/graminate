import { writable } from 'svelte/store';

export const selectedTicket = writable<{
	id: string;
	name: string;
	crop: string;
	status: string;
	dateCreated: string;
	duration: string;
} | null>(null);
