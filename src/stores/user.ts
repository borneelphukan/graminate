import { writable } from 'svelte/store';

interface User {
	isLoggedIn: boolean;
	firstName?: string;
	lastName?: string;
	email?: string;
}

const defaultUser: User = {
	isLoggedIn: false,
	firstName: '',
	lastName: '',
	email: ''
};

export const userStore = writable<User>(defaultUser);

// Usage example:
// userStore.update(user => ({ ...user, isLoggedIn: true, firstName: 'John' }));
