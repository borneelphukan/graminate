<script lang="ts">
	import { onMount } from 'svelte';

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

	let hourlyForecast: HourlyForecast[] = [];

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	async function fetchWeather(latitude: number, longitude: number) {
		try {
			const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
			if (!response.ok) {
				throw new Error(`Error fetching weather data: ${response.statusText}`);
			}
			const data = await response.json();
			const currentHour = new Date(data.current.time).getHours();
			const currentDate = new Date(data.current.time).toISOString().split('T')[0];

			const hourlyTime = data.hourly.time;
			const hourlyTemperature = Object.values(data.hourly.temperature2m);

			const hourlyData: HourlyForecast[] = hourlyTime.map((time: string, index: number) => ({
				time: time.split('T')[1].split(':')[0],
				date: time.split('T')[0],
				temperature: Math.round(hourlyTemperature[index] as number),
				icon: getHourlyWeatherIcon(
					data.hourly.rain?.[index],
					data.hourly.snowfall?.[index],
					data.hourly.cloudCover?.[index]
				)
			}));

			const filteredHourlyData = hourlyData.filter(
				(hour) => hour.date === currentDate && parseInt(hour.time) >= currentHour
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
				hourlyForecast: filteredHourlyData
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
	class="p-4 rounded-lg shadow-md max-w-sm mx-auto flex flex-col items-center"
	class:bg-blue-400={isDay === 1}
	class:bg-gray-200={isDay === 0}
	class:text-gray-100={isDay === 1}
	class:text-white={isDay === 0}
>
	{#if error}
		<p class="text-red-500 text-center">Error: {error}</p>
	{:else if temperature === null}
		<p class="text-center text-lg">Loading...</p>
	{:else}
		<div class="flex justify-between w-full">
			<div class="text-center">
				<p class="text-lg font-bold">{locationName}</p>
				<p class="text-4xl font-extrabold">{temperature}°C</p>
			</div>
			<div class="text-center">
				<p class="text-5xl">{getWeatherIcon()}</p>
				<p class="mt-2 text-sm">H: {maxTemp}°C L: {minTemp}°C</p>
			</div>
		</div>

		<hr class="my-4 w-full border-gray-600" />
		<div class="w-full overflow-x-auto">
			<div class="flex space-x-4">
				{#each hourlyForecast as hour (hour.time)}
					<div class="text-center flex-shrink-0">
						<p class="text-sm">{hour.time}:00</p>
						<p class="text-3xl">{hour.icon}</p>
						<p class="text-lg font-semibold">{hour.temperature}°C</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
