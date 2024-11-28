<script lang="ts">
	import Finderbar from '../../components/layout/Finderbar.svelte';
	import NavPanel from '../../components/layout/NavPanel.svelte';

	type View = 'distributor' | 'supplier' | 'factories'; // Define a type for views

	const buttons: { name: string; view: View }[] = [
		{ name: 'Distributor', view: 'distributor' },
		{ name: 'Supplier', view: 'supplier' },
		{ name: 'Factories', view: 'factories' }
	];

	let activeView: View = 'distributor'; // Explicitly type activeView

	const handleNavigation = (event: CustomEvent<{ view: View }>) => {
		activeView = event.detail.view;
		console.log('Active view:', activeView);
	};
</script>

<svelte:head>
	<title>Finder</title>
</svelte:head>

<div class="flex">
	<Finderbar {activeView} />

	<!-- Main Content -->
	<div class="flex-1 relative">
		<div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
			<NavPanel {buttons} {activeView} on:navigate={handleNavigation} />
		</div>

		<!-- Map Content -->
		<slot />
	</div>
</div>
