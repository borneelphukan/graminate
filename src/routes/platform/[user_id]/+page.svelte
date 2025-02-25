<script lang="ts">
	import WeatherCard from '@cards/weather/TemperatureCard.svelte';
	import ProgressCard from '@cards/ProgressCard.svelte';
	import StatusCard from '@cards/StatusCard.svelte';
	import Calendar from '@ui/Calendar.svelte';
	import Loader from '@ui/Loader.svelte';
	import { onMount } from 'svelte';
	import { temperatureScale } from '@lib/stores/settings';


	let location: { lat: number; lon: number } | null = null;
	let error: string | null = null;
	let locationServiceEnabled = true;
	let isLoading = true;

	$: fahrenheit = $temperatureScale === 'Fahrenheit';

	const steps = ['Procurement', 'Preparation', 'Farming', 'Recurring Cost', 'Harvest'];

	let currentStep: number = 1;

	onMount(() => {
		const savedStep = localStorage.getItem('currentStep');
		if (savedStep) {
			currentStep = parseInt(savedStep, 10);
		}

		checkLocationService()
			.then((coords) => {
				location = coords;
			})
			.catch((err) => {
				locationServiceEnabled = false;
				error = err;
			})
			.finally(() => {
				isLoading = false;
			});
	});

	$: if (typeof window !== 'undefined') {
		localStorage.setItem('currentStep', currentStep.toString());
	}

	async function checkLocationService(): Promise<{ lat: number; lon: number }> {
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
	<header class="px-6 py-4">
		<h1 class="text-3xl font-bold text-dark dark:text-light">Dashboard</h1>
		<hr class="mt-4 border-gray-600" />
	</header>

	{#if isLoading}
		<div class="flex justify-center items-center min-h-screen">
			<Loader />
		</div>
	{:else}
		<div class="flex gap-4 px-6 items-start">
			{#if locationServiceEnabled && location}
				<div class="flex-shrink-0 w-1/3">
					<WeatherCard lat={location.lat} lon={location.lon} {fahrenheit} />
				</div>
			{/if}

			<div class="flex-grow">
				<h2 class="text-xl font-semibold text-dark dark:text-light mb-2">Budget Tracker</h2>
				<ProgressCard {steps} {currentStep} onStepChange={({ step }) => (currentStep = step)} />
				<div class="mt-6 grid grid-cols-2 gap-6">
					{#if !error}
						<div>
							<StatusCard {steps} {currentStep} />
						</div>
					{/if}
					<div>
						<Calendar />
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>
