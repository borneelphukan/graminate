<!-- Make it more reusable -->
<script lang="ts">
	export let steps: string[] = [];
	export let currentStep: number = 1;

	let limitedSteps: string[] = [];
	$: limitedSteps = steps.slice(0, 5);
	const calculateProgress = (current: number, total: number): number => {
		return Math.min((current / total) * 100, 100);
	};
</script>

<div class="w-full bg-gradient-to-br from-gray-500 to-gray-400 p-6 shadow-lg rounded-lg z-100">
	<!-- Current Step Text -->
	<p class="text-sm font-medium text-gray-900">
		{limitedSteps[currentStep - 1] || `Step ${currentStep}`}
	</p>

	<!-- Progress Bar -->
	<div aria-hidden="true" class="mt-4">
		<div class="overflow-hidden rounded-full bg-gray-200">
			<div
				class="h-2 bg-green-200"
				style="width: {calculateProgress(currentStep, limitedSteps.length)}%;"
			></div>
		</div>

		<!-- Steps -->
		<div class="mt-4 flex justify-between text-sm font-medium text-gray-600">
			{#each limitedSteps as step, index}
				<div
					class={`flex-1 text-center ${
						index + 1 <= currentStep ? 'text-green-200' : 'text-gray-600'
					}`}
				>
					{step}
				</div>
			{/each}
		</div>
	</div>
</div>
