<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faSun } from '@fortawesome/free-solid-svg-icons';
	import UvScale from './UVScale.svelte';
	import Chart from 'chart.js/auto';

	export let lat: number | undefined;
	export let lon: number | undefined;

	let locationName: string | null = null;
	let error: string | null = null;

	const displayMode = writable('Small');

	let weatherData: any = null;
	let uvIndexToday: number | null = null;
	let uvIndexArray: { date: Date; uvIndex: number }[] = [];
	let hourlyUVDataByDay: { day: Date; uvHours: { time: Date; uv: number }[] }[] = [];
	let dropdownOpen = false;

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	let selectedDate: Date | null = null;
	let selectedHourlyData: { day: Date; uvHours: { time: Date; uv: number }[] } | undefined;

	let chartCanvas: HTMLCanvasElement;
	let chart: Chart | null = null;
	let hoveredTime: string = '';
	let hoveredUV: number = 0;
	let hoveredRisk: string = '';

	let graphWidth = 300;
	let graphHeight = 150;

	function parseTimeToMinutes(time: string): number {
		const [h, m] = time.split(':').map(Number);
		return h * 60 + m;
	}

	function calculateSunriseSunset(daylightSeconds: number): { sunrise: string; sunset: string } {
		const daylightHours = daylightSeconds / 3600;
		const halfDaylight = daylightHours / 2;
		const solarNoon = 12 * 60;
		const sunriseMinutes = solarNoon - halfDaylight * 60;
		const sunsetMinutes = solarNoon + halfDaylight * 60;
		function formatTime(minutes: number): string {
			const hours = Math.floor(minutes / 60);
			const mins = Math.floor(minutes % 60);
			return `${hours}:${mins.toString().padStart(2, '0')}`;
		}
		return { sunrise: formatTime(sunriseMinutes), sunset: formatTime(sunsetMinutes) };
	}

	async function fetchUVData(latitude: number, longitude: number) {
		try {
			const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
			if (!response.ok) {
				throw new Error(`Error fetching UV data: ${response.statusText}`);
			}
			const data = await response.json();
			return { daily: data.daily, hourly: data.hourly };
		} catch (err: any) {
			console.error(err.message);
			throw new Error('Failed to fetch UV data');
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

	function getUVRiskLevel(uv: number): { label: string; color: string } {
		const roundedUV = Math.round(uv);
		if (roundedUV <= 2) return { label: 'Low', color: 'green' };
		if (roundedUV >= 3 && roundedUV <= 5) return { label: 'Moderate', color: 'yellow' };
		if (roundedUV >= 6 && roundedUV <= 7) return { label: 'High', color: 'orange' };
		if (roundedUV >= 8 && roundedUV <= 10) return { label: 'Very High', color: 'red' };
		return { label: 'Extreme', color: 'purple' };
	}

	$: weekDates = Array.from({ length: 7 }, (_, i) => {
		const d = new Date();
		d.setDate(d.getDate() + i);
		return {
			date: new Date(d),
			weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
			day: d.toLocaleDateString(undefined, { day: 'numeric' })
		};
	});

	$: if (weatherData && $displayMode === 'Large' && !selectedDate) {
		selectedDate = weatherData.daily.time[0] ?? new Date();
	}

	onMount(async () => {
		if (lat !== undefined && lon !== undefined) {
			try {
				const [fetchedWeatherData, city] = await Promise.all([
					fetchUVData(lat, lon),
					fetchCityName(lat, lon)
				]);

				fetchedWeatherData.daily.time = fetchedWeatherData.daily.time.map(
					(d: string) => new Date(d)
				);
				fetchedWeatherData.hourly.time = fetchedWeatherData.hourly.time.map(
					(d: string) => new Date(d)
				);
				weatherData = fetchedWeatherData;
				locationName = city;
			} catch (err: any) {
				error = err.message;
			}
		} else {
			error = 'Latitude and Longitude are required to fetch UV data.';
		}
	});

	$: if (weatherData && $displayMode === 'Small') {
		const today = new Date().toISOString().split('T')[0];
		let startIndex = weatherData.daily.time.findIndex(
			(d: Date) => d.toISOString().split('T')[0] >= today
		);
		if (startIndex === -1) startIndex = 0;
		const maxUV = weatherData.daily.uvIndexMax[startIndex];
		const daylightSeconds = weatherData.daily.daylightDuration[startIndex];
		const { sunrise, sunset } = calculateSunriseSunset(daylightSeconds);
		const now = new Date();
		const nowMinutes = now.getHours() * 60 + now.getMinutes();
		const sunriseMins = parseTimeToMinutes(sunrise);
		const sunsetMins = parseTimeToMinutes(sunset);
		let currentUV = 0;
		if (nowMinutes >= sunriseMins && nowMinutes <= sunsetMins) {
			const fraction = (nowMinutes - sunriseMins) / (sunsetMins - sunriseMins);
			currentUV = maxUV * Math.sin(Math.PI * fraction);
		}
		uvIndexToday = currentUV;
		error = null;
	}

	$: if (weatherData && $displayMode === 'Large') {
		uvIndexArray = [];
		const today = new Date().toISOString().split('T')[0];
		let startIndex = weatherData.daily.time.findIndex(
			(d: Date) => d.toISOString().split('T')[0] >= today
		);
		if (startIndex === -1) startIndex = 0;
		for (let i = startIndex; i < startIndex + 7; i++) {
			if (
				weatherData.daily.uvIndexMax[i] !== undefined &&
				weatherData.daily.time[i] !== undefined
			) {
				uvIndexArray.push({
					date: weatherData.daily.time[i],
					uvIndex: weatherData.daily.uvIndexMax[i]
				});
			}
		}
		error = null;
	}

	$: if (weatherData) {
		hourlyUVDataByDay = weatherData.daily.time.map((day: Date, i: number) => {
			const daylightSeconds = weatherData.daily.daylightDuration[i];
			const { sunrise, sunset } = calculateSunriseSunset(daylightSeconds);
			const sunriseMins = parseTimeToMinutes(sunrise);
			const sunsetMins = parseTimeToMinutes(sunset);
			const uvHours = weatherData.hourly.time
				.map((hour: Date, idx: number) => {
					if (hour.toDateString() === day.toDateString()) {
						const hMins = hour.getHours() * 60 + hour.getMinutes();
						if (hMins >= sunriseMins && hMins <= sunsetMins) {
							return { time: hour, uv: weatherData.hourly.uvIndexHourly[idx] };
						}
					}
					return null;
				})
				.filter(
					(x: { time: Date; uv: number } | null): x is { time: Date; uv: number } => x !== null
				);
			return { day, uvHours };
		});
	}

	$: if (weatherData && $displayMode === 'Large' && !selectedDate) {
		selectedDate = weatherData.daily.time[0];
	}

	$: if (selectedDate) {
		selectedHourlyData = hourlyUVDataByDay.find(
			(dayData) => selectedDate && dayData.day.toDateString() === selectedDate.toDateString()
		) ?? { day: new Date(), uvHours: [] };
	}

	let chartConfig: any = {};
	$: if ($displayMode === 'Large' && selectedHourlyData && chartCanvas) {
		if (chart) {
			chart.destroy();
			chart = null;
		}

		const labels = selectedHourlyData.uvHours.map((pt) =>
			pt.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		);
		const data = selectedHourlyData.uvHours.map((pt) => pt.uv);

		const verticalLinePlugin = {
			id: 'verticalLinePlugin',
			afterDatasetsDraw: (chart: Chart) => {
				if (chart?.tooltip?.getActiveElements().length) {
					const activePoint = chart.tooltip.getActiveElements()[0];
					if (activePoint) {
						const ctx = chart.ctx;
						const x = activePoint.element.x;
						ctx.save();
						ctx.beginPath();
						ctx.moveTo(x, chart.chartArea.top);
						ctx.lineTo(x, chart.chartArea.bottom);
						ctx.lineWidth = 1;
						ctx.strokeStyle = 'red';
						ctx.setLineDash([2, 2]);
						ctx.stroke();
						ctx.restore();
					}
				}
			}
		};

		chartConfig = {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						data,
						borderColor: '#04AD79',
						borderWidth: 2,
						fill: false,
						pointRadius: 3,
						pointHoverRadius: 5
					}
				]
			},
			options: {
				maintainAspectRatio: false,
				plugins: {
					tooltip: {
						enabled: true,
						mode: 'index',
						intersect: false,
						callbacks: {
							label: function (context: any) {
								const uv = context.parsed.y;
								hoveredUV = uv;
								hoveredTime = context.label;
								hoveredRisk = getUVRiskLevel(uv).label;
								return '';
							}
						}
					},
					legend: {
						display: false
					}
				},
				hover: {
					mode: 'index',
					intersect: false
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { display: false },
						axis: 'x',
						border: {
							color: 'gray'
						}
					},
					y: {
						beginAtZero: true,
						suggestedMin: 0,
						suggestedMax: 11,
						grid: { display: false, drawTicks: false },
						ticks: { display: false },
						axis: 'y',
						border: {
							color: 'gray'
						}
					}
				},
				elements: {
					line: { borderWidth: 0 }
				}
			},
			plugins: [verticalLinePlugin]
		};

		chart = new Chart(chartCanvas, chartConfig);
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
			on:click={() => (dropdownOpen = !dropdownOpen)}
			on:keydown={(event) => {
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
				class="absolute top-8 right-0 bg-white dark:bg-gray-600 dark:text-light text-black rounded-lg shadow-lg z-20 w-32"
			>
				<button
					class="w-full text-left text-sm px-4 py-2 hover:bg-gray-500 dark:hover:bg-blue-100 cursor-pointer"
					type="button"
					on:click={() => {
						$displayMode = 'Small';
						dropdownOpen = false;
					}}
				>
					Small
				</button>
				<button
					class="w-full text-left text-sm px-4 py-2 hover:bg-gray-500 dark:hover:bg-blue-100 cursor-pointer"
					type="button"
					on:click={() => {
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
	{:else if uvIndexToday !== null}
		{#if $displayMode === 'Small'}
			<div class="flex flex-col items-left w-[180px] p-1 text-center rounded-md">
				<div class="w-full flex flex-row items-center gap-2">
					<FontAwesomeIcon icon={faSun} class="size-5 text-yellow-200" />
					<p class="text-lg tracking-wide text-gray-200 dark:text-light">UV Index</p>
				</div>
				<p class="text-2xl text-left text-dark dark:text-gray-300">{Math.round(uvIndexToday)}</p>
				<p class="text-sm dark:text-light text-dark text-left">
					{getUVRiskLevel(Math.round(uvIndexToday)).label}
				</p>
				<UvScale uvIndex={uvIndexToday} />
			</div>
		{:else if $displayMode === 'Large'}
			<div class="w-full">
				<div class="flex flex-row justify-center items-center gap-2">
					<FontAwesomeIcon icon={faSun} class="size-5 text-yellow-200" />
					<p class="text-lg tracking-wide text-gray-200 dark:text-light">UV Index</p>
				</div>
				<div class="text-center text-gray-200 dark:text-light my-2 pt-2 flex justify-center">
					{#each weekDates as dateItem}
						<div class="flex flex-col items-center">
							<span class="text-sm font-bold">{dateItem.weekday}</span>
							<button
								type="button"
								class="mx-2 flex flex-col items-center cursor-pointer px-2 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 {selectedDate &&
								dateItem.date.toDateString() === selectedDate.toDateString()
									? 'bg-green-200 text-white'
									: ''}"
								on:click={() => (selectedDate = dateItem.date)}
								on:keydown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										selectedDate = dateItem.date;
									}
								}}
								tabindex="0"
								aria-label={`Select UV data for ${dateItem.weekday}, ${dateItem.day}`}
							>
								<span class="text-xs">{dateItem.day}</span>
							</button>
						</div>
					{/each}
				</div>

				{#if selectedHourlyData && selectedHourlyData.uvHours.length > 0}
					<p class="text-center text-gray-200 dark:text-light text-lg">
						{hoveredUV ? Math.round(hoveredUV) : Math.round(selectedHourlyData.uvHours[0].uv)}
						<span>
							{hoveredRisk ? hoveredRisk : getUVRiskLevel(selectedHourlyData.uvHours[0].uv).label}
						</span>
					</p>
				{/if}

				<div style="width: {graphWidth}px; height: {graphHeight}px; margin: auto;">
					<canvas bind:this={chartCanvas}></canvas>
				</div>

				{#if selectedHourlyData && selectedHourlyData.uvHours.length > 0}
					<p class="text-center text-gray-200 dark:text-light">
						{hoveredTime
							? hoveredTime
							: selectedHourlyData.uvHours[0].time.toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit'
								})}
					</p>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
</style>
