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

	const buttonsForStep2 = [
		{ name: 'Clearing', view: 'Clearing' },
		{ name: 'Ploughing', view: 'Ploughing' },
		{ name: 'Manuring', view: 'Manuring' }
	];

	const buttonsForStep3 = [
		{ name: 'Sowing', view: 'Sowing' },
		{ name: 'Grooming', view: 'Grooming' }
	];

	const buttonsForStep4 = [
		{ name: 'Water', view: 'Water' },
		{ name: 'Pesticide', view: 'Pesticide' },
		{ name: 'Fertiliser', view: 'Fertiliser' }
	];

	const buttonsForStep5 = [
		{ name: 'Harvest', view: 'Harvest' },
		{ name: 'Process', view: 'Process' },
		{ name: 'Storage', view: 'Storage' }
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
			data: [2, 2],
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
		Clearing: {
			data: [3000, 2500],
			backgroundColor: ['#A78BFA', '#FDE68A'],
			daysLeft: 12,
			allocated: 3000,
			spent: 2500
		},
		Ploughing: {
			data: [5000, 4500],
			backgroundColor: ['#10B981', '#F9A8D4'],
			daysLeft: 8,
			allocated: 5000,
			spent: 4500
		},
		Manuring: {
			data: [4000, 3000],
			backgroundColor: ['#6B7280', '#93C5FD'],
			daysLeft: 6,
			allocated: 4000,
			spent: 3000
		},
		Sowing: {
			data: [4500, 4000],
			backgroundColor: ['#8B5CF6', '#E879F9'],
			daysLeft: 10,
			allocated: 4500,
			spent: 4000
		},
		Grooming: {
			data: [3500, 2000],
			backgroundColor: ['#34D399', '#60A5FA'],
			daysLeft: 5,
			allocated: 3500,
			spent: 2000
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
		},
		Harvest: {
			data: [7500, 6000],
			backgroundColor: ['#FB923C', '#C084FC'],
			daysLeft: 15,
			allocated: 7500,
			spent: 6000
		},
		Process: {
			data: [5000, 3500],
			backgroundColor: ['#4B5563', '#F472B6'],
			daysLeft: 10,
			allocated: 5000,
			spent: 3500
		},
		Storage: {
			data: [6000, 4500],
			backgroundColor: ['#10B981', '#6EE7B7'],
			daysLeft: 20,
			allocated: 6000,
			spent: 4500
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
		// Assign the appropriate buttons based on the current step
		if (currentStep === 1) {
			buttons = buttonsForStep1;
		} else if (currentStep === 2) {
			buttons = buttonsForStep2;
		} else if (currentStep === 3) {
			buttons = buttonsForStep3;
		} else if (currentStep === 4) {
			buttons = buttonsForStep4;
		} else if (currentStep === 5) {
			buttons = buttonsForStep5;
		}

		// Create or update the chart for steps that require it
		if ([1, 2, 3, 4, 5].includes(currentStep)) {
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

	$: {
		if (currentStep === 1) {
			buttons = buttonsForStep1;
		} else if (currentStep === 2) {
			buttons = buttonsForStep2;
		} else if (currentStep === 3) {
			buttons = buttonsForStep3;
		} else if (currentStep === 4) {
			buttons = buttonsForStep4;
		} else if (currentStep === 5) {
			buttons = buttonsForStep5;
		}
	}
</script>

<div
	class="bg-gradient-to-br from-gray-500 to-gray-400 dark:from-gray-700 rounded-lg shadow-lg p-6 md:p-2 sm:p-2 text-gray-800"
>
	{#if currentStep === 1 || currentStep === 2 || currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep === 5}
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

		<div class="flex flex-col items-center md:items-start">
			<div class="text-center w-full sm:mt-3">
				{#if currentStep === 1}
					{#if activeView === 'Seeds'}
						<p class="text-dark dark:text-light">Prepare the Seeds</p>
					{:else if activeView === 'Tools'}
						<p class="text-dark dark:text-light">Gather Tools</p>
					{:else if activeView === 'Labour'}
						<p class="text-dark dark:text-light">Assign Labour</p>
					{/if}
				{:else if currentStep === 2}
					{#if activeView === 'Clearing'}
						<p class="text-dark dark:text-light">Clearing Activities</p>
					{:else if activeView === 'Ploughing'}
						<p class="text-dark dark:text-light">Ploughing Tasks</p>
					{:else if activeView === 'Manuring'}
						<p class="text-dark dark:text-light">Manuring Steps</p>
					{/if}
				{:else if currentStep === 3}
					{#if activeView === 'Sowing'}
						<p class="text-dark dark:text-light">Sowing Guide</p>
					{:else if activeView === 'Grooming'}
						<p class="text-dark dark:text-light">Grooming Instructions</p>
					{/if}
				{:else if currentStep === 5}
					{#if activeView === 'Harvest'}
						<p class="text-dark dark:text-light">Harvest Details</p>
					{:else if activeView === 'Process'}
						<p class="text-dark dark:text-light">Processing Steps</p>
					{:else if activeView === 'Storage'}
						<p class="text-dark dark:text-light">Storage Tips</p>
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
		<div
			class="relative mx-auto flex flex-col md:flex-row px-5 items-center w-full md:mt-5 sm:my-3"
		>
			<div class="w-full md:w-1/2 mb-4 md:mb-0">
				<canvas id="status-doughnut" class="w-full"></canvas>
			</div>
			<div class="flex flex-col text-left ml-0 md:ml-4">
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
