<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
	import NavPanel from '../layout/NavPanel.svelte';

	export let steps: string[] = [];
	export let currentStep: number = 1;
	export let lastWatered: string = '01.12.2024';
	export let nextWateringDate: string = '11.12.2024';
	export let lastPesticideDone: string = '02.12.2024';
	export let nextPesticideDate: string = '07.12.2024';
	export let lastFertilizingDone: string = '03.12.2024';
	export let nextManuringDate: string = '10.12.2024';

	Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

	let chart: Chart | null = null;
	let activeView: string = 'Irrigation';

	const buttons = [
		{ name: 'Irrigation', view: 'Irrigation' },
		{ name: 'Pesticide', view: 'Pesticide' },
		{ name: 'Manuring', view: 'Manuring' }
	];

	const chartData: Record<string, { data: number[]; backgroundColor: string[]; daysLeft: number }> =
		{
			Irrigation: {
				data: [90, 10],
				backgroundColor: ['#3B82F6', '#E5E7EB'],
				daysLeft: 10
			},
			Pesticide: {
				data: [30, 70],
				backgroundColor: ['#EF4444', '#E5E7EB'],
				daysLeft: 5
			},
			Manuring: {
				data: [50, 50],
				backgroundColor: ['#F59E0B', '#E5E7EB'],
				daysLeft: 7
			}
		};

	async function createChart() {
		await tick(); // Ensure the DOM is updated before initializing the chart
		const ctx = document.getElementById('status-doughnut') as HTMLCanvasElement;
		if (!ctx) return;

		chart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				datasets: [
					{
						data: chartData[activeView].data,
						backgroundColor: chartData[activeView].backgroundColor,
						borderWidth: 0
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					tooltip: {
						callbacks: {
							label: (tooltipItem) => `${chartData[activeView].daysLeft} Days Remaining`
						}
					},
					legend: {
						position: 'top',
						labels: {
							color: '#9CA3AF'
						}
					}
				}
			}
		});
	}

	function updateChart() {
		if (chart) {
			chart.data.datasets[0].data = chartData[activeView].data;
			chart.data.datasets[0].backgroundColor = chartData[activeView].backgroundColor;
			chart.update();
		}
	}

	function destroyChart() {
		if (chart) {
			chart.destroy();
			chart = null;
		}
	}

	$: {
		// Recreate the chart when switching to step 4
		if (currentStep === 4) {
			if (!chart) {
				createChart();
			} else {
				updateChart(); // Update the chart if already created
			}
		} else {
			destroyChart(); // Clean up when switching away from step 4
		}
	}

	// Update chart when activeView changes
	$: if (currentStep === 4) {
		updateChart();
	}

	onDestroy(() => {
		destroyChart();
	});
</script>

<div
	class="bg-white bg-gradient-to-br from-gray-500 to-gray-400 rounded-lg shadow-lg p-6 md:p-2 sm:p-0 text-gray-800"
>
	{#if currentStep === 4}
		<p class="text-gray-100 text-xl font-semibold flex justify-center items-center h-full my-2">
			{steps[currentStep - 1] || `Step ${currentStep}`}
		</p>
		<NavPanel
			{buttons}
			{activeView}
			on:navigate={(event) => {
				activeView = event.detail.view;
			}}
		/>

		<div class="flex flex-col items-center sm:items-center md:items-start">
			<!-- Irrigation, Pesticide, Manuring -->

			<div class="text-center w-full sm:mt-3">
				{#if activeView === 'Irrigation'}
					<p class="text-gray-100">
						Last Irrigation: <span class="font-extralight">{lastWatered}</span>
					</p>
					<p class="text-gray-100">
						Next Irrigation: <span class="font-extralight">{nextWateringDate}</span>
					</p>
				{:else if activeView === 'Pesticide'}
					<p class="text-gray-100">
						Last Pesticide: <span class="font-extralight">{lastPesticideDone}</span>
					</p>
					<p class="text-gray-100">
						Next Pesticide: <span class="font-extralight">{nextPesticideDate}</span>
					</p>
				{:else if activeView === 'Manuring'}
					<p class="text-gray-100">
						Last Manuring: <span class="font-extralight">{lastFertilizingDone}</span>
					</p>
					<p class="text-gray-100">
						Next Manuring: <span class="font-extralight">{nextManuringDate}</span>
					</p>
				{/if}
			</div>

			<!-- Canvas -->
			<div class="relative mx-auto flex justify-center w-40 h-40 md:mt-6 sm:my-3">
				<canvas id="status-doughnut"></canvas>
			</div>
		</div>
	{:else}
		<div class="flex justify-center items-center h-full">
			<p class="text-gray-100 text-xl font-semibold flex justify-center items-center h-full my-2">
				{steps[currentStep - 1] || `Step ${currentStep}`}
			</p>
		</div>
	{/if}
</div>
