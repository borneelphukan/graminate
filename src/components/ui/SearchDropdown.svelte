<script lang="ts">
	import SearchBar from './SearchBar.svelte';
	import { writable, derived } from 'svelte/store';
	export let items: { label: string; view: string }[] = [];
	export let navigateTo: (view: string) => void;

	const searchQuery = writable('');
	const filteredItems = derived(searchQuery, ($searchQuery) =>
		items.filter((item) => item.label.toLowerCase().includes($searchQuery.toLowerCase()))
	);
</script>

<div
	class="absolute left-0 mt-5 bg-white dark:bg-dark border border-gray-300 dark:border-gray-200 rounded-md shadow-sm w-96 h-48 z-10 overflow-hidden"
>
	<div class="bg-gray-400 dark:bg-dark py-1">
		<div class="mx-3 my-1">
			<!-- Pass searchQuery to the SearchBar -->
			<SearchBar mode="type" bind:query={$searchQuery} />
		</div>
	</div>

	<ul class="overflow-y-auto h-[calc(100%-3rem)] pb-2">
		{#if $filteredItems.length > 0}
			{#each $filteredItems as item}
				<li>
					<button
						class="w-full text-sm text-dark dark:text-light text-left px-4 py-2 hover:bg-gray-500 dark:bg-gray-900 dark:hover:bg-gray-700"
						onclick={() => navigateTo(item.view)}
					>
						{item.label}
					</button>
				</li>
			{/each}
		{:else}
			<li class="text-center text-gray-300 py-2">No items found</li>
		{/if}
	</ul>
</div>
