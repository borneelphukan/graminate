<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Loader from '@ui/Loader.svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faSun } from '@fortawesome/free-solid-svg-icons';

	export let lat: number | undefined;
	export let lon: number | undefined;

	let sunriseTime: string | null = null;
	let sunsetTime: string | null = null;
	let locationName: string | null = null;
	let error: string | null = null;

	const displayMode = writable('Small');

	let dropdownOpen = false;

	let xSun = 0;
	let ySun = 0;

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	function parseTimeToMinutes(time: string): number {
		const [h, m] = time.split(':').map(Number);
		return h * 60 + m;
	}

	async function fetchSunData(latitude: number, longitude: number) {
		try {
			const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
			if (!response.ok) {
				throw new Error(`Error fetching sun data: ${response.statusText}`);
			}
			const data = await response.json();

			const today = new Date().toISOString().split('T')[0];
			const index = data.daily.time.findIndex((date: string) => date.startsWith(today));

			if (index !== -1) {
				return {
					daylightDuration: data.daily.daylightDuration[index]
				};
			} else {
				throw new Error('Daylight duration data not available for today.');
			}
		} catch (err: any) {
			console.error(err.message);
			throw new Error('Failed to fetch sun data');
		}
	}

	async function fetchCityName(latitude: number, longitude: number) {
		try {
			const response = await fetch(
				`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
			);
			if (!response.ok) {
				throw new Error(`Error fetching location data: ${response.statusText}`);
			}
			const data = await response.json();
			const cityComponent = data.results[0]?.address_components.find((component: any) =>
				component.types.includes('locality')
			);
			return cityComponent?.long_name || 'Your Location';
		} catch (err: any) {
			console.error(err.message);
			return 'Unknown city';
		}
	}

	function calculateSunriseSunset(daylightSeconds: number) {
		const daylightHours = daylightSeconds / 3600;
		const halfDaylight = daylightHours / 2;
		const solarNoon = 12 * 60;
		const sunriseMinutes = solarNoon - halfDaylight * 60;
		const sunsetMinutes = solarNoon + halfDaylight * 60;

		function formatTime(minutes: number) {
			const hours = Math.floor(minutes / 60);
			const mins = Math.floor(minutes % 60);
			return `${hours}:${mins.toString().padStart(2, '0')}`;
		}

		return {
			sunrise: formatTime(sunriseMinutes),
			sunset: formatTime(sunsetMinutes)
		};
	}

	onMount(async () => {
		if (lat !== undefined && lon !== undefined) {
			try {
				const [sunData, city] = await Promise.all([
					fetchSunData(lat, lon),
					fetchCityName(lat, lon)
				]);

				const { sunrise, sunset } = calculateSunriseSunset(sunData.daylightDuration);
				sunriseTime = sunrise;
				sunsetTime = sunset;
				locationName = city;
			} catch (err: any) {
				error = err.message;
			}
		} else {
			error = 'Latitude and Longitude are required to fetch sun data.';
		}
	});

	$: if (sunriseTime && sunsetTime) {
		const now = new Date();
		const currentMinutes = now.getHours() * 60 + now.getMinutes();

		const sunriseMins = parseTimeToMinutes(sunriseTime);
		const sunsetMins = parseTimeToMinutes(sunsetTime);

		let fraction = (currentMinutes - sunriseMins) / (sunsetMins - sunriseMins);
		if (isNaN(fraction)) fraction = 0;
		fraction = Math.max(0, Math.min(1, fraction));

		xSun = 100 * fraction;
		ySun = 25 * ((1 - fraction) ** 2 + fraction ** 2);
	}
</script>

<div
	class="p-4 rounded-lg shadow-md max-w-sm mx-auto flex flex-col items-center relative
	       bg-gradient-to-t from-gray-300 to-gray-200 text-white"
>
	<div class="absolute top-2 right-2 z-10">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6 cursor-pointer"
			onclick={() => (dropdownOpen = !dropdownOpen)}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					dropdownOpen = !dropdownOpen;
					event.preventDefault();
				}
			}}
			tabindex="0"
			role="button"
			aria-label="Toggle dropdown"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
			/>
		</svg>

		{#if dropdownOpen}
			<div
				class="absolute top-8 right-0 bg-white dark:bg-gray-700 dark:text-light text-black
				       rounded-lg shadow-lg z-20 w-32"
			>
				<button
					class="w-full text-left text-sm px-4 py-2 hover:bg-gray-500 dark:hover:bg-yellow-100 cursor-pointer"
					type="button"
					onclick={() => {
						$displayMode = 'Small';
						dropdownOpen = false;
					}}
				>
					Small
				</button>
				<button
					class="w-full text-left text-sm px-4 py-2 hover:bg-gray-500 dark:hover:bg-yellow-100 cursor-pointer"
					type="button"
					onclick={() => {
						$displayMode = 'Large';
						dropdownOpen = false;
					}}
				>
					Large
				</button>
			</div>
		{/if}
	</div>

	{#if error}
		<p class="text-red-500 text-center">Error: {error}</p>
	{:else if sunriseTime === null || sunsetTime === null}
		<Loader />
	{:else if $displayMode === 'Small'}
		<div class="flex flex-col items-center justify-center w-[180px] p-2 text-center rounded-md">
			<div class="flex flex-row items-center gap-2">
				<FontAwesomeIcon icon={faSun} class="size-5 text-gray-400" />
				<p class="font-bold text-lg uppercase tracking-wide">Sunset</p>
			</div>

			<p class="text-3xl font-semibold">{sunsetTime}</p>

			<!-- Arc: starts at lower left (0,25) and ends at lower right (100,25) -->
			<div class="relative w-full h-12">
				<svg viewBox="0 0 100 25" class="w-full h-full overflow-visible">
					<path d="M0,25 Q50,0 100,25" stroke="white" stroke-width="2" fill="none" />
					<!-- The sun is positioned along the arc -->
					<circle cx={xSun} cy={ySun} r="3" fill="white" />
				</svg>
			</div>
			<p class="mt-2 text-sm">Sunrise: {sunriseTime}</p>
		</div>
	{:else if $displayMode === 'Large'}
		<div class="text-center">
			<p class="mt-2 text-lg">Sunrise: {sunriseTime}</p>
			<p class="mt-1 text-lg">Sunset: {sunsetTime}</p>
		</div>
	{/if}
</div>

<style>
</style>
