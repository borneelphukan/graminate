<script lang="ts">
	import { onMount } from 'svelte';

	export let switchAction: () => void;

	let isDarkMode = false;

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
	<input type="checkbox" on:change={toggleTheme} class="sr-only peer" bind:checked={isDarkMode} />
	<div
		class="relative w-14 h-6 bg-gray-500 peer-focus:outline-none rounded-full
    peer peer-checked:bg-blue-100 peer-checked:dark:bg-gray-100
    after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white
    after:rounded-full after:h-6 after:w-8 after:transition-all
    after:shadow-md peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"
	>
		<span class="absolute left-2 top-1/2 -translate-y-1/2 text-yellow-500 text-base mr-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-4"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
				/>
			</svg>
		</span>
		<span class="absolute right-2 top-1/2 -translate-y-1/2 text-grey-200 text-base ml-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-4"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
				/>
			</svg>
		</span>
	</div>
</label>
