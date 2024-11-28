<script lang="ts">
	import Button from '../ui/Button.svelte';
	import BusinessCard from '../cards/BusinessCard.svelte';

	export let activeView: 'distributor' | 'supplier' | 'factories'; // Explicitly type activeView

	// Dummy data for different views
	const businessData = {
		distributor: [
			{
				name: 'Vietnamspezi',
				stars: 4.8,
				address: 'Ebertstraße 10',
				open: true,
				imageUrl: 'https://via.placeholder.com/100'
			},
			{
				name: 'GermanDistribute',
				stars: 4.5,
				address: 'Berliner Straße 12',
				open: false,
				imageUrl: 'https://via.placeholder.com/100'
			}
		],
		supplier: [
			{
				name: 'SupplyPro',
				stars: 4.9,
				address: 'Hauptstraße 15',
				open: true,
				imageUrl: 'https://via.placeholder.com/100'
			},
			{
				name: 'FastSupply',
				stars: 4.2,
				address: 'Bahnhofstraße 3',
				open: true,
				imageUrl: 'https://via.placeholder.com/100'
			}
		],
		factories: [
			{
				name: 'MegaFactory',
				stars: 4.7,
				address: 'Industriestraße 20',
				open: true,
				imageUrl: 'https://via.placeholder.com/100'
			},
			{
				name: 'EcoFactory',
				stars: 4.3,
				address: 'Werkstraße 7',
				open: false,
				imageUrl: 'https://via.placeholder.com/100'
			}
		]
	} as const; // Use `as const` for a readonly type

	function goBack() {
		history.back();
	}
</script>

<div class="container w-72 bg-gray-50 text-gray-800 border-r border-gray-400 min-h-screen">
	<div class="flex items-center bg-green-200 rounded-l-md">
		<Button text="" style="ghost" arrow="left" on:click={goBack} />
		<div class="text-lg font-semibold text-gray-500 py-2 flex-grow">
			{#if activeView === 'distributor'}
				Distributor
			{:else if activeView === 'supplier'}
				Supplier
			{:else if activeView === 'factories'}
				Factories
			{/if}
		</div>
	</div>

	<div class="">
		<ul>
			{#each businessData[activeView] as business}
				<BusinessCard
					businessName={business.name}
					stars={business.stars}
					address={business.address}
					open={business.open}
					imageUrl={business.imageUrl}
				/>
			{/each}
		</ul>
	</div>
</div>
