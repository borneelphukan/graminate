<script lang="ts">
	import Navbar from '../../../components/layout/Navbars/Navbar.svelte';
	import Sidebar from '@layout/Sidebar.svelte';
	import { page } from '$app/stores';
	import '../../../app.css';
	import { onMount } from 'svelte';

	let isOpen = false;
	let userId: string | undefined;

	function handleSectionChange(event: CustomEvent<string>) {
		const section = event.detail;
		console.log(`Navigating to section: ${section}`);
	}

	onMount(() => {
		const savedTheme = localStorage.getItem('theme') || 'light';
		document.documentElement.classList.toggle('dark', savedTheme === 'dark');
	});

	page.subscribe(($page) => {
		userId = $page.params.user_id;
	});
</script>

<svelte:head>
	<title>Graminate ERP</title>
</svelte:head>

<div class="flex flex-col min-h-screen bg-light dark:bg-dark text-gray-800 dark:text-gray-100">
	<Navbar />

	<div class="flex flex-1">
		<Sidebar {isOpen} {userId} on:onSectionChange={handleSectionChange} />

		<!-- Main Content -->
		<div class="flex-1 p-4">
			<slot />
		</div>
	</div>
</div>
