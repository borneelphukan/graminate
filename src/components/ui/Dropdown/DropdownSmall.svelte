<script lang="ts">
	export let items: string[] = [];
	export let selected: string = '';
	export let direction: 'up' | 'down' = 'down';
	export let label: string | null = null;
	export let placeholder: string = 'Select an option'; // New placeholder parameter
	let labelOpen: boolean = false;
	const dropdownId = `dropdown-${Math.random().toString(36).substring(2, 15)}`;
</script>

<div class="relative w-full md:w-auto">
	{#if label}
		<label for={dropdownId} class="block mb-1 text-sm font-medium text-dark dark:text-gray-300"
			>{label}</label
		>
	{/if}

	<button
		class="w-full bg-white dark:bg-gray-700 dark:text-light text-sm p-1 rounded flex justify-between items-center"
		on:click={() => (labelOpen = !labelOpen)}
		style="min-width: 180px; max-width: 90%; box-sizing: border-box;"
		aria-haspopup="listbox"
		aria-expanded={labelOpen}
	>
		{selected || placeholder}
		<!-- Use the placeholder parameter -->
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
				d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
			/>
		</svg>
	</button>

	{#if labelOpen}
		<ul
			class="absolute {direction === 'up'
				? 'bottom-full mb-2'
				: 'top-full mt-2'} left-0 dark:text-light bg-white dark:bg-gray-800 shadow-md rounded max-h-40 overflow-y-auto z-50"
			style="min-width: 180px; max-width: 90%; box-sizing: border-box;"
			role="listbox"
		>
			{#each items as item}
				<li
					role="option"
					tabindex="0"
					class="px-4 py-2 text-sm hover:bg-gray-500 dark:hover:bg-blue-100 cursor-pointer"
					on:click={() => {
						selected = item;
						labelOpen = false;
					}}
					on:keydown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							selected = item;
							labelOpen = false;
						}
					}}
					aria-selected={selected === item}
				>
					{item}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.size-6 {
		width: 1.5rem;
		height: 1.5rem;
	}
</style>
