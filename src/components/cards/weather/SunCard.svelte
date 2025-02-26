<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faSun } from '@fortawesome/free-solid-svg-icons';

	export let lat: number | undefined;
	export let lon: number | undefined;

	let sunriseTime: string | null = null;
	let sunsetTime: string | null = null;
	let locationName: string | null = null;
	let error: string | null = null;

	const displayMode = writable('Small');
	let sunTimesArray: { date: string; sunrise: string; sunset: string }[] = [];
	let dailySunData: any = null;

	let dropdownOpen = false;
	let xSun = 0;
	let ySun = 0;

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	function parseTimeToMinutes(time: string): number {
		const [h, m] = time.split(':').map(Number);
		return h * 60 + m;
	}

	function formatTimeFromMinutes(minutes: number): string {
		const hrs = Math.floor(minutes / 60);
		const mins = Math.floor(minutes % 60);
		return `${hrs}:${mins.toString().padStart(2, '0')}`;
	}

	function formatDuration(minutes: number): string {
		const hrs = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hrs}h ${mins}m`;
	}

	async function fetchSunData(latitude: number, longitude: number) {
		try {
			const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
			if (!response.ok) {
				throw new Error(`Error fetching sun data: ${response.statusText}`);
			}
			const data = await response.json();
			return data.daily;
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
				const [fetchedDailySunData, city] = await Promise.all([
					fetchSunData(lat, lon),
					fetchCityName(lat, lon)
				]);
				dailySunData = fetchedDailySunData;
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
		if ($displayMode === 'Small') {
			let t = (currentMinutes - sunriseMins) / (sunsetMins - sunriseMins);
			t = Math.max(0, Math.min(1, t));
			xSun = 160 * t;
			ySun = 50 * (1 - t) ** 2 + 50 * t ** 2;
		} else {
			let fraction = (currentMinutes - sunriseMins) / (sunsetMins - sunriseMins);
			if (isNaN(fraction)) fraction = 0;
			fraction = Math.max(0, Math.min(1, fraction));
			xSun = 100 * fraction;
			ySun = 25 * ((1 - fraction) ** 2 + fraction ** 2);
		}
	}

	$: if (dailySunData && $displayMode === 'Small') {
		const today = new Date().toISOString().split('T')[0];
		let startIndex = dailySunData.time.findIndex((date: string) => date >= today);
		if (startIndex === -1) {
			startIndex = 0;
		}
		const { sunrise, sunset } = calculateSunriseSunset(dailySunData.daylightDuration[startIndex]);
		sunriseTime = sunrise;
		sunsetTime = sunset;
		error = null;
	}

	// Reactive block for Large displayMode.
	$: if (dailySunData && $displayMode === 'Large') {
		sunTimesArray = [];
		const today = new Date().toISOString().split('T')[0];
		let startIndex = dailySunData.time.findIndex((date: string) => date >= today);
		if (startIndex === -1) {
			startIndex = 0;
		}
		for (let i = startIndex; i < startIndex + 7; i++) {
			if (dailySunData.daylightDuration[i] !== undefined && dailySunData.time[i] !== undefined) {
				const { sunrise, sunset } = calculateSunriseSunset(dailySunData.daylightDuration[i]);
				sunTimesArray.push({
					date: dailySunData.time[i],
					sunrise,
					sunset
				});
			}
		}
		error = null;
	}

	let displayedSunsetTime: string | null = null;
	let sunsetLabel: string = '';
	$: if ($displayMode === 'Large' && sunTimesArray.length > 1) {
		const now = new Date();
		const currentMinutes = now.getHours() * 60 + now.getMinutes();
		const todaysSunriseMinutes = parseTimeToMinutes(sunTimesArray[0].sunrise);
		const todaysSunsetMinutes = parseTimeToMinutes(sunTimesArray[0].sunset);

		if (currentMinutes >= todaysSunriseMinutes && currentMinutes < todaysSunsetMinutes) {
			displayedSunsetTime = sunTimesArray[0].sunset;
			sunsetLabel = 'Sunset Today';
		} else {
			displayedSunsetTime = sunTimesArray[1].sunset;
			sunsetLabel = 'Sunset Tomorrow';
		}
	}
</script>

<div
	class="p-4 rounded-lg shadow-md max-w-sm mx-auto flex flex-col items-center relative dark:bg-gray-700 bg-gray-500"
>
	<div class="absolute top-2 right-2 z-10">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6 cursor-pointer text-dark dark:text-light"
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
				class="absolute top-8 right-0 bg-white dark:bg-gray-600 dark:text-light text-black
               rounded-lg shadow-lg z-20 w-32"
			>
				<button
					class="w-full text-left text-sm px-4 py-2 hover:bg-gray-500 dark:hover:bg-blue-100 cursor-pointer"
					type="button"
					onclick={() => {
						$displayMode = 'Small';
						dropdownOpen = false;
					}}
				>
					Small
				</button>
				<button
					class="w-full text-left text-sm px-4 py-2 hover:bg-gray-500 dark:hover:bg-blue-100 cursor-pointer"
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
	{:else if sunriseTime !== null && sunsetTime !== null}
		{#if $displayMode === 'Small'}
			<div class="flex flex-col items-center justify-center w-[180px] p-1 text-center rounded-md">
				<div class="w-full flex flex-col items-start">
					<div class="flex flex-row items-center gap-2">
						<FontAwesomeIcon icon={faSun} class="size-5 text-yellow-200" />
						<p class="text-lg tracking-wide text-gray-200 dark:text-light">Sunset</p>
					</div>
					<p class="text-2xl text-gray-200 dark:text-gray-300">{sunsetTime}</p>
				</div>
				<div class="relative w-full">
					<svg viewBox="0 0 160 60" class="w-full h-full overflow-visible">
						<path d="M0,50 Q80,0 160,50 L160,45 L0,45 Z" class="fill-gray-500 dark:fill-gray-600" />

						<path
							d="M0,50 Q80,0 160,50"
							class="stroke-dark dark:stroke-gray-300"
							stroke-width="1"
							fill="none"
							stroke-dasharray="2,2"
						/>

						<line
							x1="0"
							y1="45"
							x2="160"
							y2="45"
							class="stroke-dark dark:stroke-gray-300"
							stroke-width="1"
						/>

						<g>
							<!-- Sun -->
							<circle
								cx={xSun}
								cy={ySun}
								r="5"
								class={ySun > 45 ? 'fill-gray-200 dark:fill-dark' : 'fill-yellow-200'}
							/>

							<!-- Sun Rays -->
							{#each Array(8) as _, i}
								<line
									x1={xSun + Math.cos((i * 45 * Math.PI) / 180) * 7}
									y1={ySun + Math.sin((i * 45 * Math.PI) / 180) * 7}
									x2={xSun + Math.cos((i * 45 * Math.PI) / 180) * 10}
									y2={ySun + Math.sin((i * 45 * Math.PI) / 180) * 10}
									class="stroke-yellow-200 dark:stroke-gray-400"
									stroke-width="1.5"
								/>
							{/each}
						</g>
					</svg>
				</div>
				<p class="mt-2 text-lg text-dark dark:text-light">Sunrise: {sunriseTime}</p>
			</div>
		{:else if $displayMode === 'Large'}
			{#if sunTimesArray.length > 1}
				{#if displayedSunsetTime}
					<div class="flex flex-col pb-4">
						<div class="text-sm text-center text-dark dark:text-light">{sunsetLabel}</div>
						<div class="text-center text-3xl font-semibold text-gray-200 dark:text-light">
							{displayedSunsetTime}
						</div>
					</div>
				{/if}
				<div class="mt-1 w-full max-w-2xl">
					<div class="flex flex-row justify-between border-b border-gray-300 py-2">
						<div class="text-sm text-dark dark:text-light">First Light</div>
						<div class="text-right text-dark dark:text-light">
							{formatTimeFromMinutes(
								Math.max(parseTimeToMinutes(sunTimesArray[0].sunrise) - 30, 0)
							)}
						</div>
					</div>
					<div class="flex flex-row justify-between border-b border-gray-300 py-2">
						<div class="text-sm text-dark dark:text-light">Sunrise Today</div>
						<div class="text-right text-dark dark:text-light">{sunTimesArray[0].sunrise}</div>
					</div>
					<div class="flex flex-row justify-between border-b border-gray-300 py-2">
						<div class="text-sm text-dark dark:text-light">Sunset Today</div>
						<div class="text-right text-dark dark:text-light">{sunTimesArray[0].sunset}</div>
					</div>
					<div class="flex flex-row justify-between border-b border-gray-300 py-2">
						<div class="text-sm text-dark dark:text-light">Last Light</div>
						<div class="text-right text-dark dark:text-light">
							{formatTimeFromMinutes(
								Math.min(parseTimeToMinutes(sunTimesArray[0].sunset) + 30, 1440)
							)}
						</div>
					</div>
					<div class="flex flex-row justify-between border-b border-gray-300 py-2">
						<div class="text-sm text-dark dark:text-light">Total Daylight Duration</div>
						<div class="text-right text-dark dark:text-light">
							{formatDuration(
								parseTimeToMinutes(sunTimesArray[0].sunset) -
									parseTimeToMinutes(sunTimesArray[0].sunrise)
							)}
						</div>
					</div>
				</div>

				<p class="my-4 text-sm text-dark dark:text-light">
					Sunrise &amp; Sunset for the upcoming days
				</p>
				<div class="overflow-y-auto" style="max-height: 150px;">
					<div class="text-center px-2 flex flex-col items-center w-full">
						{#each sunTimesArray as sunData (sunData.date)}
							<div
								class="mx-2 border-b border-gray-300 p-1 my-1 grid grid-cols-[auto,auto,auto,auto] items-center gap-6 w-full max-w-2xl"
							>
								<p class="text-sm text-center w-4 text-dark dark:text-light">
									{new Date(sunData.date).toLocaleDateString(undefined, { weekday: 'short' })}
								</p>

								<p class="text-sm text-center w-8 text-dark dark:text-light">{sunData.sunrise}</p>

								<div class="relative h-1 bg-gray-300 dark:bg-gray-100 w-16 rounded-full">
									<div
										class="h-full bg-blue-200 absolute rounded-full"
										style="left: {(parseTimeToMinutes(sunData.sunrise) / 1440) *
											100}%; width: {((parseTimeToMinutes(sunData.sunset) -
											parseTimeToMinutes(sunData.sunrise)) /
											1440) *
											100}%"
									></div>
								</div>
								<p class="text-sm text-center w-8 text-dark dark:text-light">{sunData.sunset}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>

<style>
</style>
