<!-- THINGS TO DO -->
<!-- 1. Stitch weather data into the component properly -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { getWeather } from '../../lib/utils/loadWeather';

	export let debug: boolean = false;
	export let lat: number | null = null;
	export let lon: number | null = null;
	export let city: string = 'Tinsukia';
	export let currentTemp: number = 5;
	export let weatherDescription: string = 'Cloudy';
	export let highTemp: number = 6;
	export let lowTemp: number = 3;

	export let hourlyForecast = [
		{ time: '00', temp: 5 },
		{ time: '01', temp: 5 },
		{ time: '02', temp: 5 },
		{ time: '03', temp: 5 },
		{ time: '04', temp: 4 },
		{ time: '05', temp: 4 }
	];

	export let dailyForecast = [
		{ day: 'Sat', min: 2, max: 5, icon: '🌧' },
		{ day: 'Sun', min: 2, max: 6, icon: '☁️' },
		{ day: 'Mon', min: 0, max: 2, icon: '☁️' },
		{ day: 'Tue', min: -1, max: 1, icon: '☁️' },
		{ day: 'Wed', min: -1, max: 1, icon: '☁️' }
	];

	let error: string | null = null;

	onMount(async () => {
		if (!debug) {
			try {
				if (lat === null || lon === null) {
					throw new Error('Latitude and Longitude must be provided when debug is false.');
				}

				const data = await getWeather(lat, lon);

				city = data.timezone.split('/')[1].replace('_', ' ');
				currentTemp = data.current.temp;
				weatherDescription = data.current.weather[0].description;
				highTemp = data.daily[0].temp.max;
				lowTemp = data.daily[0].temp.min;

				hourlyForecast = data.hourly.slice(0, 6).map((hour: any) => ({
					time: new Date(hour.dt * 1000).getHours().toString().padStart(2, '0'),
					temp: Math.round(hour.temp)
				}));

				dailyForecast = data.daily.slice(0, 5).map((day: any) => ({
					day: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
					min: Math.round(day.temp.min),
					max: Math.round(day.temp.max),
					icon: getWeatherIcon(day.weather[0].icon)
				}));
			} catch (err: any) {
				error = `Cannot fetch API data: ${err.message}`;
				console.error(error);
			}
		}
	});

	function getWeatherIcon(iconCode: string): string {
		const iconMap: { [key: string]: string } = {
			'01d': '☀️', // Clear day
			'01n': '🌙', // Clear night
			'02d': '⛅', // Few clouds day
			'02n': '☁️', // Few clouds night
			'03d': '☁️', // Cloudy
			'03n': '☁️',
			'04d': '☁️',
			'04n': '☁️',
			'09d': '🌧', // Rain
			'09n': '🌧',
			'10d': '🌦', // Rain day
			'10n': '🌦', // Rain night
			'11d': '⛈', // Thunderstorm
			'11n': '⛈',
			'13d': '❄️', // Snow
			'13n': '❄️',
			'50d': '🌫', // Mist
			'50n': '🌫'
		};

		return iconMap[iconCode] || '☁️'; // Default to cloudy
	}

	let view: string = 'Large';
	let dropdownOpen = false;

	function changeView(selectedView: string) {
		view = selectedView;
		dropdownOpen = false;
	}
</script>

<div
	class="relative max-w-md mx-auto p-6 bg-gradient-to-br from-gray-500 to-gray-400 text-gray-100 rounded-lg shadow-lg"
>
	<!-- Dropdown Menu -->
	<div class="absolute top-2 right-2">
		<div class="relative">
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div class="dot-button" on:click={() => (dropdownOpen = !dropdownOpen)}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
					/>
				</svg>
			</div>

			{#if dropdownOpen}
				<div class="dropdown-menu">
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="cursor-pointer hover:bg-gray-700 p-2" on:click={() => changeView('Large')}>
						Large
					</div>
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="cursor-pointer hover:bg-gray-700 p-2" on:click={() => changeView('Medium')}>
						Medium
					</div>
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="cursor-pointer hover:bg-gray-700 p-2" on:click={() => changeView('Small')}>
						Small
					</div>
				</div>
			{/if}
		</div>
	</div>

	{#if error}
		<p class="text-red-500">{error}</p>
	{:else}
		{#if view === 'Large' || view === 'Medium'}
			<div class="flex items-center justify-between">
				<!-- City and Current Temperature -->
				<div class="flex flex-col">
					<h2 class="text-xl font-bold break-normal">{city}</h2>
					<p class="text-5xl font-bold">{currentTemp}°C</p>
				</div>

				<!-- Weather Description and High/Low Temperatures -->
				<div class="flex flex-col items-end">
					<p class="text-sm capitalize"><span class="px-2 text-2xl my-auto flex-col items-center">☁️</span>{weatherDescription}</p>
					<p class="text-sm">H:{highTemp}°C L:{lowTemp}°C</p>
				</div>
			</div>
		{/if}

		<!-- Hourly Forecast -->
		{#if view === 'Large' || view === 'Medium'}
			<div class="flex space-x-4 overflow-x-auto py-2">
				{#each hourlyForecast as hour}
					<div class="text-center flex-shrink-0">
						<p class="text-sm">{hour.time}:00</p>
						<p class="text-lg font-semibold">{hour.temp}°C</p>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Daily Forecast -->
		{#if view === 'Large'}
			<div>
				<hr class="my-4 border-gray-600" />
				{#each dailyForecast as day}
					<div class="flex items-center justify-between py-1">
						<div class="flex items-center space-x-4">
							<p class="text-sm">{day.day}</p>
							<span>{day.icon}</span>
						</div>
						<div class="flex space-x-2 items-center">
							<p class="text-sm">{day.min}°C</p>
							<div class="h-2 w-24 bg-gray-700 rounded-full">
								<div
									class="h-2 bg-blue-500 rounded-full"
									style="width: calc({(day.max - day.min) / 10} * 100%)"
								></div>
							</div>
							<p class="text-sm">{day.max}°C</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Small View -->
		{#if view === 'Small'}
			<div class="flex flex-col space-y-1">
				<!-- City -->
				<h2 class="text-xl font-bold break-words">{city}</h2>

				<!-- Current Temperature -->
				<p class="text-5xl font-bold">{currentTemp}°C</p>

				<!-- Weather Icon and Description -->
				<div class="flex items-center space-x-2">
					<p class="text-4xl">☁️</p>
					<!-- Placeholder icon -->
					<div>
						<p class="text-sm capitalize">{weatherDescription}</p>
						<p class="text-sm">H:{highTemp}°C L:{lowTemp}°C</p>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.dropdown-menu {
		@apply absolute top-4 right-2 bg-gray-800 text-white rounded w-52 p-2 z-50;
	}
	.dot-button {
		@apply cursor-pointer w-6 h-6 flex items-center justify-center;
	}
</style>
