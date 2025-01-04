<script lang="ts">
	import Navbar from '../../components/layout/Navbar.svelte';
	import Sidebar from '../../components/layout/Sidebar.svelte';
	import '../../app.css';
	import { onMount } from 'svelte';

	let isOpen = false;

	function handleSectionChange(event: CustomEvent<string>) {
		const section = event.detail;
		console.log(`Navigating to section: ${section}`);
	}

	onMount(() => {
		const savedTheme = localStorage.getItem('theme') || 'light';
		document.documentElement.classList.toggle('dark', savedTheme === 'dark');
	});
</script>

<svelte:head>
	<title>FarmMate ERP</title>
</svelte:head>

<div class="flex flex-col min-h-screen bg-light dark:bg-dark text-gray-800 dark:text-gray-100">
	<Navbar />

	<div class="flex flex-1">
		<Sidebar {isOpen} on:onSectionChange={handleSectionChange} />

		<!-- Main Content -->
		<div class="flex-1 p-4">
			<slot />
		</div>
	</div>
</div>

<style>
</style>
