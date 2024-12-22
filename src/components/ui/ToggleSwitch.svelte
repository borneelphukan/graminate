<script lang="ts">
	import { onMount } from 'svelte';

	export let switchAction: () => void;

	// Reactive variable to manage the toggle state
	let isDarkMode = false;

	// Function to toggle the theme and update the reactive variable
	function toggleTheme() {
		isDarkMode = !isDarkMode;
		const htmlElement = document.documentElement;
		if (isDarkMode) {
			htmlElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			htmlElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
		switchAction?.();
	}

	// Apply the saved theme on page load
	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme === 'dark') {
			isDarkMode = true;
			document.documentElement.classList.add('dark');
		} else {
			isDarkMode = false;
			document.documentElement.classList.remove('dark');
		}
	});
</script>

<label class="inline-flex flex-col cursor-pointer">
	<!-- Bind the "checked" state to the reactive variable -->
	<input type="checkbox" on:change={toggleTheme} class="sr-only peer" bind:checked={isDarkMode} />
	<div
		class="relative w-14 h-6 bg-gray-400 peer-focus:outline-none rounded-full
    peer peer-checked:bg-blue-100 peer-checked:dark:bg-gray-100
    after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white
    after:rounded-full after:h-6 after:w-8 after:transition-all
    after:shadow-md peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"
	>
		<span class="absolute left-2 top-1/2 -translate-y-1/2 text-yellow-400 text-base"> ☀️ </span>
		<span class="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 text-base"> 🌙 </span>
	</div>
</label>
