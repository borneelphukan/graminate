<script lang="ts">
	import WeatherCard from '../../components/cards/WeatherCard.svelte';
	import ProgressCard from '../../components/cards/ProgressCard.svelte';
	import StatusCard from '../../components/cards/StatusCard.svelte';
	import { onMount } from 'svelte';
	import Loader from '../../components/ui/Loader.svelte';
	import Calendar from '../../components/ui/Calendar.svelte';

	let location: { lat: number; lon: number } | null = null;
	let error: string | null = null;

	// Progress data
	const steps = [
		'Plant Preparation',
		'Soil Preparation',
		'Tea Planting',
		'Routine Maintainance',
		'Harvest'
	];
	let currentStep = 4;

	onMount(() => {
		getCurrentLocation()
			.then((coords) => {
				location = coords;
			})
			.catch((err) => {
				error = err;
			});
	});

	async function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				reject('Geolocation is not supported by your browser.');
				return;
			}
			navigator.geolocation.getCurrentPosition(
				(position) => {
					resolve({
						lat: position.coords.latitude,
						lon: position.coords.longitude
					});
				},
				() => {
					reject('Unable to fetch location. Please enable location services.');
				}
			);
		});
	}
</script>

<main class="min-h-screen text-white relative">
	<!-- Dashboard Header -->
	<header class="px-6 py-4">
		<h1 class="text-3xl font-bold text-gray-100">Dashboard</h1>
		<hr class="mt-4 border-gray-600" />
	</header>

	<!-- Weather Card and Progress Card Row -->
	<div class="flex gap-4 px-6 items-start">
		{#if error}
			<!-- Error message centered -->
			<p class="flex-grow text-red-500">{error}</p>
		{:else if location}
			<!-- Render WeatherCard and ProgressCard -->
			<div class="flex gap-4 w-full z-100">
				<div class="flex-shrink-0 w-1/3">
					<WeatherCard lat={location.lat} lon={location.lon} debug={true} />
				</div>
				<div class="flex-grow">
					<h2 class="text-xl font-semibold text-gray-200 mb-2">Farming Milestones</h2>
					<ProgressCard {steps} {currentStep} />
					<div class="mt-6 grid grid-cols-2 gap-6">
						<!-- StatusCard -->
						<div>
							<StatusCard
								lastWatered="01.12.2024"
								nextWateringDate="11.12.2024"
								lastPesticideDone="02.12.2024"
								nextPesticideDate="07.12.2024"
								lastFertilizingDone="03.12.2024"
								nextManuringDate="10.12.2024"
							/>
						</div>
						<!-- Calendar Component -->
						<div>
							<Calendar />
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- Loading state centered -->
			<div class="absolute inset-0 flex items-center justify-center">
				<Loader />
			</div>
		{/if}
	</div>
</main>
