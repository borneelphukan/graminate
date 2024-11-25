<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let items: string[] = [];
	export let selectedItem: string = '';
	export let type: string = '';
	export let label: string = '';
	export let width: 'full' | 'half' | 'auto' = 'auto'; // Added 'half' as an option

	const dispatch = createEventDispatcher();

	let isOpen = false;

	const toggleDropdown = () => {
		isOpen = !isOpen;
	};

	const selectItem = (item: string) => {
		selectedItem = item;
		isOpen = false;
		dispatch('select', { item });
	};

	$: displayLabel = type === 'form' && !selectedItem ? 'Please select' : selectedItem;
</script>

<div>
	{#if type === 'form' && label}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="block mb-1 text-sm font-medium text-gray-700">{label}</label>
	{/if}

	<div
		class={`relative inline-block text-left ${
			type === 'form' ? 'border border-gray-300 rounded-md' : ''
		} ${width === 'full' ? 'w-full' : width === 'half' ? 'w-1/2' : 'w-auto'}`}
	>
		<!-- Selected Item Button -->
		<button
			class="flex items-center justify-between px-4 py-2 text-sm bg-white hover:underline w-full"
			on:click={toggleDropdown}
		>
			{displayLabel}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="w-5 h-5 ml-2 -mr-1 text-gray-300"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>

		<!-- Dropdown Menu -->
		{#if isOpen}
			<ul
				class="absolute z-10 mt-2 bg-white rounded-md shadow-lg text-center max-h-40 overflow-y-auto w-full"
			>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				{#each items as item}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<li
						class="px-4 py-2 text-blue-100 text-sm font-medium cursor-pointer hover:bg-gray-400"
						on:click={() => selectItem(item)}
					>
						{item}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.max-h-40 {
		max-height: 10rem;
	}

	.overflow-y-auto {
		overflow-y: auto;
	}
</style>
