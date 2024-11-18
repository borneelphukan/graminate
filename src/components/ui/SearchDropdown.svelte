<script lang="ts">
	import SearchBar from '../../components/ui/SearchBar.svelte';
	import { writable, derived } from 'svelte/store';

	export let items: { label: string; view: string }[] = [];
	export let navigateTo: (view: string) => void;

	// Search query state
	const searchQuery = writable('');

	// Filtered items based on search query
	const filteredItems = derived(searchQuery, ($searchQuery) =>
		items.filter((item) => item.label.toLowerCase().includes($searchQuery.toLowerCase()))
	);
</script>

<div
	class="absolute left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-sm w-96 h-48 z-10 overflow-hidden"
>
	<!-- Search bar section -->
	<div class="bg-green-300 py-1">
		<div class="mx-3 my-1">
			<!-- Pass searchQuery to the SearchBar -->
			<SearchBar bind:query={$searchQuery} />
		</div>
	</div>

	<!-- Scrollable items -->
	<ul class="overflow-y-auto h-[calc(100%-3rem)] pb-2">
		{#if $filteredItems.length > 0}
			{#each $filteredItems as item}
				<li>
					<button
						class="w-full text-sm text-gray-200 text-left px-4 py-2 hover:bg-green-400"
						on:click={() => navigateTo(item.view)}
					>
						{item.label}
					</button>
				</li>
			{/each}
		{:else}
			<li class="text-center text-gray-500 py-2">No items found</li>
		{/if}
	</ul>
</div>
