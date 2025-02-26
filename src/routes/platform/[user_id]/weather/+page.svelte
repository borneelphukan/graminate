<script lang="ts">
	import SunCard from '@cards/weather/SunCard.svelte';
	import UvCard from '@cards/weather/UVCard.svelte';
	import TemperatureCard from '@cards/weather/TemperatureCard.svelte';
	import Loader from '@ui/Loader.svelte';
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

<main class="min-h-screen text-white px-6 py-4">
	<header>
		<h1 class="text-3xl font-bold text-dark dark:text-light">Weather</h1>
		<hr class="mt-4 border-gray-600" />
	</header>

	{#if error}
		<p class="flex items-center justify-center text-red-500 mt-6">{error}</p>
	{:else if !location}
		<div class="flex items-center justify-center min-h-screen">
			<Loader />
		</div>
	{:else}
		<div class="flex flex-col md:flex-row items-start justify-start gap-2 mt-6 w-full">
			<TemperatureCard lat={location.lat} lon={location.lon} {fahrenheit} />
			<SunCard lat={location.lat} lon={location.lon} />
			<UvCard	lat={location.lat} lon={location.lon} />
		</div>
	{/if}
</main>
