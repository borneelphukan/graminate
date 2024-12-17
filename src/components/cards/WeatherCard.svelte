<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Loader from '../../components/ui/Loader.svelte';

	export let lat: number | undefined;
	export let lon: number | undefined;

	let temperature: number | null = null;
	let apparentTemperature: number | null = null;
	let maxTemp: number | null = null;
	let minTemp: number | null = null;
	let locationName: string | null = null;
	let isDay: number | null = null;
	let rain: number | null = null;
	let snowfall: number | null = null;
	let cloudCover: number | null = null;
	let error: string | null = null;

	type HourlyForecast = {
		time: string;
		temperature: number;
		date: string;
		icon: string;
	};

	type DailyForecast = {
		day: string;
		maxTemp: number;
		minTemp: number;
		icon: string;
	};

	let hourlyForecast: HourlyForecast[] = [];
	let dailyForecast: DailyForecast[] = [];

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	let dropdownOpen = false;
	let displayMode = writable('Large');

	async function fetchWeather(latitude: number, longitude: number) {
		try {
			const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
			if (!response.ok) {
				throw new Error(`Error fetching weather data: ${response.statusText}`);
			}
			const data = await response.json();

			const todayDate = new Date(data.current.time).toISOString().split('T')[0];

			const dailyData: DailyForecast[] = data.daily.time
				.map((date: string, index: number): DailyForecast => {
					const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

					let icon = '☀️';
					if (data.daily.snowfallSum[index] > 0) {
						icon = '❄️';
					} else if (data.daily.rainSum[index] > 0) {
						icon = '🌧';
					} else if (data.daily.showersSum[index] > 0) {
						icon = '🌦';
					} else if (data.daily.precipitationSum[index] > 0) {
						icon = '🌧';
					} else if (data.daily.cloudCover?.[index] > 0) {
						icon = '☁️';
					}

					return {
						day,
						maxTemp: Math.round(data.daily.temperature2mMax[index]),
						minTemp: Math.round(data.daily.temperature2mMin[index]),
						icon
					};
				})
				.filter((_: any, index: number) => data.daily.time[index] > todayDate);

			const hourlyTime = data.hourly.time;
			const hourlyTemperature = Object.values(data.hourly.temperature2m);

			const hourlyData: HourlyForecast[] = hourlyTime.map(
				(time: string, index: number): HourlyForecast => ({
					time: time.split('T')[1].split(':')[0],
					date: time.split('T')[0],
					temperature: Math.round(hourlyTemperature[index] as number),
					icon: getHourlyWeatherIcon(
						data.hourly.rain?.[index],
						data.hourly.snowfall?.[index],
						data.hourly.cloudCover?.[index]
					)
				})
			);

			const filteredHourlyData = hourlyData.filter(
				(hour) =>
					new Date(`${hour.date}T${hour.time}:00Z`) >= new Date(data.current.time) &&
					new Date(`${hour.date}T${hour.time}:00Z`) <
						new Date(new Date(data.current.time).getTime() + 24 * 60 * 60 * 1000)
			);

			return {
				temperature: Math.round(data.current.temperature2m),
				apparentTemperature: Math.round(data.current.apparentTemperature),
				isDay: data.current.isDay,
				rain: data.current.rain,
				snowfall: data.current.snowfall,
				cloudCover: data.current.cloudCover,
				maxTemp: Math.round(data.daily.temperature2mMax[0]),
				minTemp: Math.round(data.daily.temperature2mMin[0]),
				hourlyForecast: filteredHourlyData,
				dailyForecast: dailyData
			};
		} catch (err: any) {
			console.error(err.message);
			throw new Error('Failed to fetch weather data');
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
			return cityComponent?.long_name || 'Unknown city';
		} catch (err: any) {
			console.error(err.message);
			return 'Unknown city';
		}
	}

	function getHourlyWeatherIcon(rain?: number, snowfall?: number, cloudCover?: number): string {
		if (rain && rain > 0) return '🌧';
		if (snowfall && snowfall > 0) return '❄️';
		if (cloudCover && cloudCover > 0) return '☁️';
		return '☀️';
	}

	function getWeatherIcon(): string {
		if (rain && rain > 0) return '🌧';
		if (snowfall && snowfall > 0) return '❄️';
		if (cloudCover && cloudCover > 0) return '☁️';
		return '☀️';
	}

	onMount(async () => {
		if (lat !== undefined && lon !== undefined) {
			try {
				const [weatherData, city] = await Promise.all([
					fetchWeather(lat, lon),
					fetchCityName(lat, lon)
				]);
				temperature = weatherData.temperature;
				apparentTemperature = weatherData.apparentTemperature;
				isDay = weatherData.isDay;
				rain = weatherData.rain;
				snowfall = weatherData.snowfall;
				cloudCover = weatherData.cloudCover;
				maxTemp = weatherData.maxTemp;
				minTemp = weatherData.minTemp;
				hourlyForecast = weatherData.hourlyForecast;
				dailyForecast = weatherData.dailyForecast;
				locationName = city;
			} catch (err: any) {
				error = err.message;
			}
		} else {
			error = 'Latitude and Longitude are required to fetch weather data.';
		}
	});
</script>

<div
	class={`p-4 rounded-lg shadow-md max-w-sm mx-auto flex flex-col items-center relative 
        ${isDay === 1 ? 'bg-gradient-to-t from-blue-300 to-blue-200 text-white' : 'bg-gradient-to-t from-blue-950 to-blue-100 text-white'}`}
>
	<!-- Dropdown Toggle -->
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

		<!-- Dropdown Menu -->
		{#if dropdownOpen}
			<div class="absolute top-8 right-0 bg-white text-black rounded-lg shadow-lg z-20 w-32">
				<button
					class="w-full text-left px-4 py-2 hover:bg-gray-500 hover:rounded-lg cursor-pointer"
					type="button"
					onclick={() => {
						$displayMode = 'Small';
						dropdownOpen = false;
					}}
				>
					Small
				</button>
				<button
					class="w-full text-left px-4 py-2 hover:bg-gray-500 cursor-pointer"
					type="button"
					onclick={() => {
						$displayMode = 'Medium';
						dropdownOpen = false;
					}}
				>
					Medium
				</button>
				<button
					class="w-full text-left px-4 py-2 hover:bg-gray-500 hover:rounded-lg cursor-pointer"
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
	{:else if temperature === null}
		<Loader />
	{:else}
		{#if $displayMode === 'Small' || $displayMode === 'Medium' || $displayMode === 'Large'}
			<!-- First Section -->
			<div class="flex justify-between w-full">
				<div class="text-center">
					<p class="text-lg font-bold">{locationName}</p>
					<p class="text-4xl font-bold">{temperature}°</p>
				</div>
				<div class="text-center">
					<p class="text-5xl">{getWeatherIcon()}</p>
					<p class="mt-2 text-sm">H: {maxTemp}°C L: {minTemp}°C</p>
					<p class="mt-1 text-sm">Feels like: {apparentTemperature}°C</p>
				</div>
			</div>
		{/if}

		{#if $displayMode === 'Medium' || $displayMode === 'Large'}
			<!-- Second Section -->
			<hr class="my-4 w-full" />
			<div class="w-full overflow-x-auto">
				<div class="flex space-x-4">
					{#each hourlyForecast as hour (hour.time)}
						<div class="text-center flex-shrink-0">
							<p class="text-sm">{hour.time}:00</p>
							<p class="text-3xl">{hour.icon}</p>
							<p class="text-lg font-semibold">{hour.temperature}°</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if $displayMode === 'Large'}
			<!-- Third Section -->
			<hr class="my-3 w-full" />
			<div class="w-full flex flex-col items-center">
				{#each dailyForecast as day}
					<div class="flex justify-between items-center w-full">
						<p class="text-lg font-semibold w-1/3 text-center">{day.day}</p>
						<p class="text-3xl w-1/3 text-center">{day.icon}</p>
						<p class="text-lg w-1/3 text-center">{day.minTemp}°C</p>
						<p class="text-lg w-1/3 text-center">{day.maxTemp}°C</p>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
