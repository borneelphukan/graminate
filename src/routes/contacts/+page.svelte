<script lang="ts">
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';

	// Extract the view from query parameters
	const view = derived(page, ($page) => $page.url.searchParams.get('view') || 'contacts');
</script>

{#if $view === 'contacts'}
	<h1>Contacts View</h1>
	<!-- Render Contacts content -->
{:else if $view === 'companies'}
	<h1>Companies View</h1>
	<!-- Render Companies content -->
{:else if $view === 'deals'}
	<h1>Deals View</h1>
	<!-- Render Deals content -->
{:else}
	<h1>Unknown View</h1>
	<!-- Render fallback content -->
{/if}
