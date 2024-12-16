<script lang="ts">
	type ButtonData = {
		name: string;
		view: string;
	};

	export let buttons: ButtonData[] = [];
	export let activeView: string = 'profile';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let isMenuOpen = false;

	const setActive = (view: string) => {
		dispatch('navigate', { view });
		isMenuOpen = false; // Close the menu after selection
	};
</script>

<div class="relative">
	<!-- Desktop Navigation -->
	<div class="hidden md:flex">
		{#each buttons as { name, view }}
			<button
				class="flex-1 px-4 py-2 text-center text-sm font-medium
					border border-gray-300 bg-neutral-100 focus:outline-none
					{activeView === view
					? 'border-b-transparent bg-white font-semibold'
					: 'text-gray-600 font-thin'}"
				onclick={() => setActive(view)}
			>
				{name}
			</button>
		{/each}
	</div>

	<!-- Hamburger Menu for Smaller Screens -->
	<div class="flex md:hidden justify-center">
		<div class="flex flex-col items-center w-full relative">
			<!-- Hamburger Icon -->
			<button
				class="p-2 rounded-md focus:outline-none text-gray-100"
				onclick={() => (isMenuOpen = !isMenuOpen)}
				aria-label="Open menu"
			>
				<svg
					class="w-6 h-6"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>

			<!-- Extended Menu -->
			{#if isMenuOpen}
				<div class="absolute top-full left-0 z-50 w-full bg-white text-gray-100">
					{#each buttons as { name, view }}
						<button class="w-full px-4 py-2 text-left text-sm" onclick={() => setActive(view)}>
							{name}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
