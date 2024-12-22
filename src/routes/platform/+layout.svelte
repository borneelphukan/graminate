<script lang="ts">
	import Navbar from '../../components/layout/Navbar.svelte';
	import Sidebar from '../../components/layout/Sidebar.svelte';
	import '../../app.css';
	import { onMount } from 'svelte';

	let isOpen = false;

	// Handle sidebar section change
	function handleSectionChange(event: CustomEvent<string>) {
		const section = event.detail;
		console.log(`Navigating to section: ${section}`);
	}

	// Apply saved theme preference on app load
	onMount(() => {
		const savedTheme = localStorage.getItem('theme') || 'light';
		document.documentElement.classList.toggle('dark', savedTheme === 'dark');
	});

	// Toggle theme function
	function toggleTheme() {
		const htmlElement = document.documentElement;
		if (htmlElement.classList.contains('dark')) {
			htmlElement.classList.remove('dark');
			localStorage.setItem('theme', 'light'); // Save preference
		} else {
			htmlElement.classList.add('dark');
			localStorage.setItem('theme', 'dark'); // Save preference
		}
	}
</script>

<svelte:head>
	<title>FarmHub CRM</title>
</svelte:head>

<div class="flex flex-col min-h-screen bg-light dark:bg-dark text-gray-800 dark:text-gray-100">
	<Navbar />

	<div class="flex flex-1">
		<Sidebar {isOpen} on:onSectionChange={handleSectionChange} />

		<!-- Main Content -->
		<div class="flex-1 p-4">
			<!-- Slot for the page content -->
			<slot />
		</div>
	</div>
</div>

<style>
	.flex {
		display: flex;
	}
	.flex-1 {
		flex: 1;
	}
	.min-h-screen {
		min-height: 100vh;
	}
	.flex-col {
		flex-direction: column;
	}
</style>
