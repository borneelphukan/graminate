<script lang="ts">
	import Navbar from '../../components/layout/Navbar.svelte';
	import Sidebar from '../../components/layout/Sidebar.svelte';
	import '../../app.css';

	let isOpen = false;
	function handleSectionChange(event: CustomEvent<string>) {
		const section = event.detail;
		console.log(`Navigating to section: ${section}`);
	}
</script>

<svelte:head>
	<title>FarmHub CRM</title>
</svelte:head>

<div class="flex flex-col min-h-screen">
	<Navbar />

	<div class="flex flex-1">
		<Sidebar {isOpen} on:onSectionChange={handleSectionChange} />

		<!-- Main Content -->
		<div class="flex-1">
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
