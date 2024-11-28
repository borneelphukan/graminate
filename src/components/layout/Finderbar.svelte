<script lang="ts">
	import Button from '../ui/Button.svelte';
	import BusinessCard from '../cards/BusinessCard.svelte';

	// These data will be from the server
	const business = {
		name: 'Vietnamspezi',
		stars: 4.8,
		address: 'Ebertstraße 10',
		open: true,
		imageUrl: 'https://via.placeholder.com/100' // Example image URL
	};

	function goBack() {
		history.back();
	}
</script>

<div class="container w-72 bg-gray-50 text-gray-800 border-r border-gray-400 min-h-screen">
	<div class="flex items-center bg-green-200 rounded-l-md">
		<Button text="" style="ghost" arrow="left" on:click={goBack} />
		<div class="text-lg font-semibold text-gray-500 py-2 flex-grow">Distributor</div>
	</div>

	<div class="px-4">
		<div class="mt-4">
			<ul>
				<BusinessCard
					businessName={business.name}
					stars={business.stars}
					address={business.address}
					open={business.open}
					imageUrl={business.imageUrl}
				/>
				<BusinessCard
					businessName={business.name}
					stars={business.stars}
					address={business.address}
					open={business.open}
					imageUrl={business.imageUrl}
				/>
			</ul>
		</div>
	</div>
</div>
