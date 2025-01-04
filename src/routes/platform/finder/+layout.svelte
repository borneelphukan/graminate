<script lang="ts">
	import Finderbar from '@layout/Finderbar.svelte';
	import NavPanel from '@layout/NavPanel.svelte';

	type View = 'distributor' | 'exporter' | 'factories';

	const buttons: { name: string; view: View }[] = [
		{ name: 'Distributor', view: 'distributor' },
		{ name: 'Exporter', view: 'exporter' },
		{ name: 'Factories', view: 'factories' }
	];

	let activeView: View = 'distributor';

	const handleNavigation = (event: CustomEvent<{ view: View }>) => {
		activeView = event.detail.view;
	};
</script>

<div class="relative h-screen">
	<!-- Map Content -->
	<div class="absolute inset-0">
		<slot />
	</div>

	<!-- Finderbar (responsive for larger screens) -->
	<div class="absolute top-12 left-0 h-[calc(100%-4rem)] w-64 z-30 hidden lg:block">
		<Finderbar {activeView} />
	</div>

	<!-- NavPanel (responsive) -->
	<div class="absolute top-2 left-2 w-72 sm:w-96 z-40">
		<NavPanel {buttons} {activeView} on:navigate={handleNavigation} />
	</div>
</div>
