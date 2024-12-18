<script lang="ts">
	// Define switchAction as a function that accepts a boolean argument
	export let switchAction: (isDark: boolean) => void = () => {};

	let isDarkMode = false;

	// Function to toggle light/dark theme
	function toggleTheme() {
		isDarkMode = !isDarkMode;

		// Toggle "dark" class on <html>
		document.documentElement.classList.toggle('dark', isDarkMode);

		// Call any external action passed as a prop
		switchAction(isDarkMode);
	}
</script>

<label class="inline-flex flex-col cursor-pointer">
	<input
		type="checkbox"
		value=""
		checked={isDarkMode}
		on:change={toggleTheme}
		class="sr-only peer"
	/>
	<div
		class="relative w-11 h-5 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:bg-green-100 peer-checked:after:border-green-200 after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md peer-checked:bg-green-200 dark:bg-gray-200 peer-checked:dark:bg-green-100"
	></div>
</label>
