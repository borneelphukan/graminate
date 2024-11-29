<script lang="ts">
	import Finderbar from '../../components/layout/Finderbar.svelte';
	import NavPanel from '../../components/layout/NavPanel.svelte';

	type View = 'distributor' | 'exporter' | 'factories';

	const buttons: { name: string; view: View }[] = [
		{ name: 'Distributor', view: 'distributor' },
		{ name: 'Exporter', view: 'exporter' },
		{ name: 'Factories', view: 'factories' }
	];

	let activeView: View = 'distributor';

	const handleNavigation = (event: CustomEvent<{ view: View }>) => {
		activeView = event.detail.view;
		console.log('Active view:', activeView);
	};
</script>

<svelte:head>
	<title>Finder</title>
</svelte:head>

<!-- Fullscreen layout -->
<div class="relative h-screen">
	<!-- Map Content -->
	<div class="absolute inset-0">
		<slot />
	</div>

	<!-- Floating Finderbar -->
	<div class="absolute top-0 left-0 h-screen w-72 shadow-lg z-30">
		<Finderbar {activeView} />
	</div>

	<!-- Floating NavPanel -->
	<div class="absolute top-4 left-1/2 transform -translate-x-1/2">
		<NavPanel {buttons} {activeView} on:navigate={handleNavigation} />
	</div>
</div>
