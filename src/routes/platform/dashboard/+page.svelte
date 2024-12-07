<script lang="ts">
	import WeatherCard from '../../../components/cards/WeatherCard.svelte';
	import { onMount } from 'svelte';
	import Loader from '../../../components/ui/Loader.svelte';

	let location: { lat: number; lon: number } | null = null;
	let error: string | null = null;

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
	<header class=" px-6 py-4">
		<h1 class="text-3xl font-bold text-gray-100">Dashboard</h1>
		<hr class="mt-4 border-gray-600" />
	</header>

	<!-- Weather Card and Content -->
	<div>
		{#if error}
			<!-- Error message centered -->
			<p class="absolute inset-0 flex items-center justify-center text-red-500">{error}</p>
		{:else if location}
			<!-- Render WeatherCard in top-left corner -->
			<div class="absolute left-4">
				<WeatherCard lat={location.lat} lon={location.lon} debug={true} />
			</div>
		{:else}
			<!-- Loading state centered -->
			<div class="absolute inset-0 flex items-center justify-center">
				<Loader />
			</div>
		{/if}
	</div>
</main>
