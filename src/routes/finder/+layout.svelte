<script lang="ts">
	import SettingsBar from '../../components/layout/SettingsBar.svelte';
	import NavPanel from '../../components/layout/NavPanel.svelte';

	const buttons = [
		{ name: 'Distributor', view: 'distributor' },
		{ name: 'Supplier', view: 'supplier' },
		{ name: 'Factories', view: 'factories' }
	];

	let activeView = 'distributor';

	const handleNavigation = (event: CustomEvent<{ view: string }>) => {
		activeView = event.detail.view;
		console.log('Active view:', activeView);
	};
</script>

<svelte:head>
	<title>Finder</title>
</svelte:head>

<div class="flex flex-col min-h-screen">
	<div class="flex flex-1">
		<!-- Sidebar -->
		<!-- <SettingsBar /> -->

		<!-- Main Content -->
		<div class="flex-1 relative">
			<div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
				<NavPanel {buttons} {activeView} on:navigate={handleNavigation} />
			</div>

			<!-- Map Content -->
			<slot />
		</div>
	</div>
</div>

<style>
</style>
