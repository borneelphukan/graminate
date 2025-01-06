<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
	import NavPanel from '@layout/NavPanel.svelte';

	export let steps: string[] = [];
	export let currentStep: number = 1;
	let allocated: number;
	let spent: number;

	Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

	let chart: Chart | null = null;
	let activeView: string = currentStep === 1 ? 'Seeds' : 'Fertiliser';

	const buttonsForStep1 = [
		{ name: 'Seeds', view: 'Seeds' },
		{ name: 'Tools', view: 'Tools' },
		{ name: 'Labour', view: 'Labour' }
	];

	const buttonsForStep4 = [
		{ name: 'Water', view: 'Water' },
		{ name: 'Pesticide', view: 'Pesticide' },
		{ name: 'Fertiliser', view: 'Fertiliser' }
	];

	let buttons = currentStep === 1 ? buttonsForStep1 : buttonsForStep4;

	const chartData: Record<
		string,
		{
			data: number[];
			backgroundColor: string[];
			daysLeft: number;
			allocated: number;
			spent: number;
		}
	> = {
		Seeds: {
			data: [5000, 3500],
			backgroundColor: ['#4CAF50', '#FFC107'],
			daysLeft: 15,
			allocated: 5000,
			spent: 3500
		},
		Tools: {
			data: [4000, 2000],
			backgroundColor: ['#673AB7', '#FF5722'],
			daysLeft: 20,
			allocated: 4000,
			spent: 2000
		},
		Labour: {
			data: [7000, 6000],
			backgroundColor: ['#FF9800', '#8BC34A'],
			daysLeft: 10,
			allocated: 7000,
			spent: 6000
		},
		Water: {
			data: [8000, 7000],
			backgroundColor: ['#3B82F6', '#E5E7EB'],
			daysLeft: 10,
			allocated: 8000,
			spent: 7000
		},
		Pesticide: {
			data: [6000, 5000],
			backgroundColor: ['#EF4444', '#E5E7EB'],
			daysLeft: 5,
			allocated: 6000,
			spent: 5000
		},
		Fertiliser: {
			data: [10000, 5000],
			backgroundColor: ['#F59E0B', '#E5E7EB'],
			daysLeft: 7,
			allocated: 10000,
			spent: 5000
		}
	};

	async function createChart() {
		await tick();
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
							label: (tooltipItem) =>
								`${tooltipItem.label}: ₹${chartData[activeView].data[tooltipItem.dataIndex]}`
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
		buttons = currentStep === 1 ? buttonsForStep1 : buttonsForStep4;

		if (currentStep === 4 || currentStep === 1) {
			if (!chart) {
				createChart();
			} else {
				updateChart();
			}
		} else {
			destroyChart();
		}
	}

	$: {
		allocated = chartData[activeView]?.allocated || 0;
		spent = chartData[activeView]?.spent || 0;
	}

	onDestroy(() => {
		destroyChart();
	});
</script>

<div
	class="bg-gradient-to-br from-gray-500 to-gray-400 dark:from-gray-700 rounded-lg shadow-lg p-6 md:p-2 sm:p-0 text-gray-800"
>
	{#if currentStep === 4 || currentStep === 1}
		<p class="dark:text-light text-xl font-semibold flex justify-center items-center h-full my-2">
			{steps[currentStep - 1] || `Step ${currentStep}`}
		</p>
		<NavPanel
			{buttons}
			{activeView}
			on:navigate={(event) => {
				activeView = event.detail.view;
				updateChart();
			}}
		/>

		<div class="flex flex-col items-center sm:items-center md:items-start">
			<div class="text-center w-full sm:mt-3">
				{#if currentStep === 1}
					{#if activeView === 'Seeds'}
						<p class="text-dark dark:text-light">Prepare the Seeds</p>
					{:else if activeView === 'Tools'}
						<p class="text-dark dark:text-light">Gather Tools</p>
					{:else if activeView === 'Labour'}
						<p class="text-dark dark:text-light">Assign Labour</p>
					{/if}
				{:else if currentStep === 4}
					{#if activeView === 'Water'}
						<p class="text-dark dark:text-light">Watering Budget</p>
					{:else if activeView === 'Pesticide'}
						<p class="text-dark dark:text-light">Pesticide Budget</p>
					{:else if activeView === 'Fertiliser'}
						<p class="text-dark dark:text-light">Fertilizer Budget</p>
					{/if}
				{/if}
			</div>
		</div>
		<div class="relative mx-auto flex justify-center items-center w-full md:mt- sm:my-3">
			<div class="w-2/5">
				<canvas id="status-doughnut" class="w-full"></canvas>
			</div>
			<div class="flex flex-col text-left ml-4">
				<p class="text-dark dark:text-light">Allocated: ₹{chartData[activeView]?.allocated || 0}</p>
				<p class="text-dark dark:text-light">Spent: ₹{chartData[activeView]?.spent || 0}</p>
			</div>
		</div>
	{:else}
		<div class="flex justify-center items-center h-full">
			<p
				class="text-gray-100 dark:text-light text-xl font-semibold flex justify-center items-center h-full my-2"
			>
				{steps[currentStep - 1] || `Step ${currentStep}`}
			</p>
		</div>
	{/if}
</div>
