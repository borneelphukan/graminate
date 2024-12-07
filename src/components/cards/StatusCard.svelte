<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
	import NavPanel from '../layout/NavPanel.svelte';

	Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

	export let visible: boolean = false;

	let chart: Chart | null = null;
	let activeView: string = 'Watering';

	// Button data for the NavPanel
	const buttons = [
		{ name: 'Watering', view: 'Watering' },
		{ name: 'Pesticide', view: 'Pesticide' },
		{ name: 'Fertilizers', view: 'Fertilizers' }
	];

	// Chart data with days left and descriptions
	const chartData: Record<
		string,
		{ data: number[]; backgroundColor: string[]; daysLeftText: string }
	> = {
		Watering: {
			data: [90, 10],
			backgroundColor: ['#3B82F6', '#E5E7EB'], // Blue and gray
			daysLeftText: '10 days left for Watering'
		},
		Pesticide: {
			data: [30, 70],
			backgroundColor: ['#EF4444', '#E5E7EB'],
			daysLeftText: '5 days left for Pest control'
		},
		Fertilizers: {
			data: [50, 50],
			backgroundColor: ['#F59E0B', '#E5E7EB'], // Yellow and gray
			daysLeftText: '7 days left for Manuring'
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

		// Initialize chart
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
							label: () => chartData[activeView].daysLeftText // Display formatted days left
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

	// Clean up the chart on destroy
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

{#if visible}
	<div
		class="bg-white bg-gradient-to-br from-gray-500 to-gray-400 rounded-lg shadow-lg p-6 w-1/2 text-gray-800"
	>
		<!-- NavPanel -->
		<NavPanel {buttons} {activeView} on:navigate={handleNavigation} />

		<!-- Doughnut Chart -->
		<div class="relative flex justify-center h-48 mt-6">
			<canvas id="status-doughnut"></canvas>
		</div>
	</div>
{/if}
