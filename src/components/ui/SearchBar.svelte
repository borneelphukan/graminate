<script lang="ts">
	export let query: string = '';
	export let placeholder: string = '';
	export let mode: string = '';

	if (mode === 'table' && !placeholder) {
		throw new Error("The 'placeholder' parameter is mandatory when 'mode' is set to 'table'.");
	}

	if (mode === 'type' && !placeholder) {
		placeholder = 'Search';
	}

	const handleSearch = () => {
		dispatchSearchEvent();
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			handleSearch();
		}
	};

	const dispatchSearchEvent = () => {
		const searchEvent = new CustomEvent('search', {
			detail: query
		});
		dispatchEvent(searchEvent);
	};
</script>

<div class="relative">
	<input
		type="text"
		bind:value={query}
		{placeholder}
		class="w-full px-4 py-1 border border-gray-300 focus:border-green-200 rounded-md focus:outline-none"
		onkeydown={handleKeyDown}
	/>
	<button
		class="absolute inset-y-0 right-4 flex items-center"
		onclick={handleSearch}
		aria-label="Search"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
			/>
		</svg>
	</button>
</div>
