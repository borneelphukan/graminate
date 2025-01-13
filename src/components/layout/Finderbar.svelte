<script lang="ts">
	import BusinessCard from '@cards/BusinessCard.svelte';
	import { onMount } from 'svelte';

	export let activeView: 'distributor' | 'exporter' | 'factories';

	type Business = {
		name: string;
		stars: number;
		address: string;
		open: boolean;
		imageUrl: string;
		price: number;
	};

	const businessData: Record<typeof activeView, Business[]> = {
		distributor: [
			{
				name: 'Kirti Tea Trading',
				stars: 4.1,
				address: 'Tinsukia, Assam',
				open: true,
				imageUrl: 'https://via.placeholder.com/100',
				price: 56
			},
			{
				name: 'Om Adishakti Pvt Ltd',
				stars: 2.9,
				address: 'Kolkata, West Bengal',
				open: false,
				imageUrl: 'https://via.placeholder.com/100',
				price: 25
			},
			{
				name: 'Basundhara Tea',
				stars: 4.3,
				address: 'Sonitpur, Assam',
				open: false,
				imageUrl: 'https://via.placeholder.com/100',
				price: 45
			},
			{
				name: 'Assamica Agro',
				stars: 4.9,
				address: 'Assam, India',
				open: false,
				imageUrl: 'https://via.placeholder.com/100',
				price: 65
			}
		],
		exporter: [
			{
				name: 'Assam Company India Ltd.',
				stars: 4.2,
				address: 'Guwahati, Assam',
				open: true,
				imageUrl: 'https://via.placeholder.com/100',
				price: 23
			},
			{
				name: 'Halmari Tea',
				stars: 4.5,
				address: 'Dibrugarh, Assam',
				open: false,
				imageUrl: 'https://via.placeholder.com/100',
				price: 56
			},
			{
				name: 'McLeod Russel India Ltd.',
				stars: 2.8,
				address: 'Kolkata, West Bengal',
				open: false,
				imageUrl: 'https://via.placeholder.com/100',
				price: 45
			},
			{
				name: 'Goodricke Group Limited',
				stars: 3.8,
				address: 'Kolkata, West Bengal',
				open: false,
				imageUrl: 'https://via.placeholder.com/100',
				price: 87
			}
		],
		factories: [
			{
				name: 'Halmari Tea Factory',
				stars: 4.7,
				address: 'Dibrugarh, Assam',
				open: true,
				imageUrl: 'https://via.placeholder.com/100',
				price: 69
			},
			{
				name: 'Damayanti Tea Industries',
				stars: 4.6,
				address: 'Assam, India',
				open: false,
				imageUrl: 'https://via.placeholder.com/100',
				price: 84
			},
			{
				name: 'Chota Tingrai Tea Estate',
				stars: 4.4,
				address: 'Tinsukia, Assam',
				open: false,
				imageUrl: 'https://via.placeholder.com/100',
				price: 15
			},
			{
				name: 'Nefaa Tea',
				stars: 4.6,
				address: 'Upper Assam, India',
				open: false,
				imageUrl: 'https://via.placeholder.com/100',
				price: 98
			}
		]
	};

	let sortedData: Business[] = [];
	let sortOption: 'relevance' | 'rating' | 'price' = 'relevance';
	let showDropdown = false;

	function handleSort(option: 'relevance' | 'rating' | 'price') {
		sortOption = option;
		showDropdown = false;

		if (sortOption === 'rating') {
			// Sort by rating in descending order
			sortedData = [...businessData[activeView]].sort((a, b) => b.stars - a.stars);
		} else if (sortOption === 'price') {
			// Sort by price in descending order (highest price first)
			sortedData = [...businessData[activeView]].sort((a, b) => b.price - a.price);
		} else if (sortOption === 'relevance') {
			// Sort by relevance: lowest price and highest rating at the top
			sortedData = [...businessData[activeView]].sort((a, b) => {
				if (a.price === b.price) {
					return b.stars - a.stars;
				}
				return a.price - b.price;
			});
		}
	}

	onMount(() => {
		sortedData = [...businessData[activeView]];
	});
	$: sortedData = [...businessData[activeView]];
</script>

<div class="container w-96 text-gray-800 m-2 border-gray-400 min-h-screen">
	<div class="flex items-center rounded-t-md bg-green-200 px-2">
		<div class="text-lg font-semibold text-gray-500 p-2 flex-grow">
			{#if activeView === 'distributor'}
				Distributor
			{:else if activeView === 'exporter'}
				Exporter
			{:else if activeView === 'factories'}
				Factories
			{/if}
		</div>
		<div class="relative">
			<button
				class="flex items-center gap-2 text-gray-500 rounded-lg px-3"
				onclick={() => (showDropdown = !showDropdown)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-4"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
					/>
				</svg>

				Sort

				<!-- Conditional rendering of the dropdown arrow SVG -->
				{#if showDropdown}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-3"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-3"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
					</svg>
				{/if}
			</button>

			{#if showDropdown}
				<div class="absolute right-0 w-60 bg-white rounded shadow-md mt-1 z-10">
					<label class="block px-4 py-2">
						<input
							type="radio"
							name="sort"
							value="relevance"
							bind:group={sortOption}
							onchange={() => handleSort('relevance')}
						/>
						Relevance
					</label>
					<label class="block px-4 py-2">
						<input
							type="radio"
							name="sort"
							value="rating"
							bind:group={sortOption}
							onchange={() => handleSort('rating')}
						/>
						Rating
					</label>
					<label class="block px-4 py-2">
						<input
							type="radio"
							name="sort"
							value="price"
							bind:group={sortOption}
							onchange={() => handleSort('price')}
						/>
						Price
					</label>
				</div>
			{/if}
		</div>
	</div>

	<div class="overflow-y-auto max-h-[calc(100vh-4rem)]">
		<ul>
			{#each sortedData as business}
				<BusinessCard
					businessName={business.name}
					stars={business.stars}
					address={business.address}
					open={business.open}
					imageUrl={business.imageUrl}
					price={business.price}
				/>
			{/each}
		</ul>
	</div>
</div>
