<script lang="ts">
	import WeatherCard from '@cards/WeatherCard.svelte';
	import { temperatureScale } from '@lib/stores/settings';
	import { onMount } from 'svelte';

	let location: { lat: number; lon: number } | null = null;
	let error: string | null = null;

	$: fahrenheit = $temperatureScale === 'Fahrenheit';

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
	<header class=" px-6 py-4">
		<h1 class="text-3xl font-bold text-dark dark:text-light">Weather</h1>
		<hr class="mt-4 border-gray-600" />
	</header>

	<div>
		{#if error}
			<p class="absolute inset-0 flex items-center justify-center text-red-500">{error}</p>
		{:else if location}
			<div class="absolute left-4">
				<WeatherCard lat={location.lat} lon={location.lon} {fahrenheit} />
			</div>
		{/if}
	</div>
</main>
