<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
	import NavPanel from '../layout/NavPanel.svelte';

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

	function updateChart() {
		if (chart) {
			const currentData = chartData[activeView];
			chart.data.datasets[0].data = currentData.data;
			chart.data.datasets[0].backgroundColor = currentData.backgroundColor;
			chart.update();
		}
	}

	onMount(() => {
		const ctx = document.getElementById('status-doughnut') as HTMLCanvasElement;

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
							label: () => `${chartData[activeView].daysLeft} Days Remaining`
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
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}
	});

	function handleNavigation(event: CustomEvent<{ view: string }>) {
		activeView = event.detail.view;
		updateChart();
	}
</script>

<div
	class="bg-white bg-gradient-to-br from-gray-500 to-gray-400 rounded-lg shadow-lg p-6 text-gray-800"
>
	<NavPanel {buttons} {activeView} on:navigate={handleNavigation} />

	<div class="flex flex-col items-center">
		<div class="text-left w-full my-3">
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

		<div class="relative flex justify-center w-40 h-40">
			<canvas id="status-doughnut"></canvas>
		</div>
	</div>
</div>
