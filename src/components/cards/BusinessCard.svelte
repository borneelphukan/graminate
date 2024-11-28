<script lang="ts">
	export let businessName: string;
	export let stars: number;
	export let address: string;
	export let open: boolean;
	export let imageUrl: string; // New prop for the image URL

	const renderStars = (rating: number) => {
		const roundedRating = Math.round(rating);
		const fullStars = roundedRating;
		const emptyStars = 5 - fullStars;
		return [...Array(fullStars).fill('★'), ...Array(emptyStars).fill('☆')];
	};
</script>

<div class="max-w-md flex rounded-md shadow-md bg-white p-4 my-2">
	<div class="flex-1 flex flex-col justify-between">
		<div>
			<h2 class="text-lg font-semibold text-gray-800">{businessName}</h2>
			<div class="flex items-center">
				<div class="flex space-x-1 text-yellow-500">
					{#each renderStars(stars) as star}
						<span>{star}</span>
					{/each}
				</div>
				<span class="text-sm text-gray-600 ml-2">({stars.toFixed(1)})</span>
			</div>
			<p class="text-gray-700 text-sm">{address}</p>
			<div class="text-sm font-medium">
				{#if open}
					<span class="text-green-500">Open</span>
				{:else}
					<span class="text-red-500">Closed</span>
				{/if}
			</div>
		</div>
	</div>
	<div class="w-24 h-24 ml-2">
		<img src={imageUrl} alt={businessName} class="w-full h-full object-cover rounded-md" />
	</div>
</div>
