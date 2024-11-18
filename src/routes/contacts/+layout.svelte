<script lang="ts">
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import SearchDropdown from '../../components/ui/SearchDropdown.svelte';
	import Button from '../../components/ui/Button.svelte';

	const view = derived(page, ($page) => $page.url.searchParams.get('view') || 'contacts');

	let dropdownOpen = false;

	function navigateTo(view: string) {
		const url = new URL(window.location.href);
		url.searchParams.set('view', view);
		window.location.href = url.toString();
		dropdownOpen = false;
	}

	// all the dropdown items for the dropdown on the top left
	const dropdownItems = [
		{ label: 'Contacts', view: 'contacts' },
		{ label: 'Companies', view: 'companies' },
		{ label: 'Deals', view: 'deals' },
		{ label: 'Invoices', view: 'invoices' },
		{ label: 'Tickets', view: 'tickets' }
	];
</script>

<div class="flex justify-between items-center px-4 py-1 border-b bg-white relative">
	<div class="relative">
		<button
			class="flex items-center text-lg font-semibold bg-white rounded py-2 focus:outline-none"
			on:click={() => (dropdownOpen = !dropdownOpen)}
		>
			{#if $view === 'contacts'}
				Contacts
			{:else if $view === 'companies'}
				Companies
			{:else if $view === 'deals'}
				Deals
			{:else}
				Unknown View
			{/if}
			<svg
				class="ml-2 w-4 h-4 transform transition-transform"
				style:rotate={dropdownOpen ? '180deg' : '0deg'}
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if dropdownOpen}
			<SearchDropdown items={dropdownItems} {navigateTo} />
		{/if}
	</div>

	<div class="flex gap-2">
		<Button text="Actions" style="secondary" arrow="down" />
		<Button text="Import" style="secondary" />
		<Button
			text={`Create ${$view === 'contacts' ? 'contact' : $view === 'companies' ? 'company' : ''}`}
			style="primary"
		/>
	</div>
</div>

<slot />
