<script lang="ts">
	export let steps: string[] = [];
	export let currentStep: number = 1;

	import Step1 from '@icons/prepare.svg';
	import Step2 from '@icons/soil.svg';
	import Step3 from '@icons/plant.svg';
	import Step4 from '@icons/routine.svg';
	import Step5 from '@icons/harvest.svg';
	import { fly } from 'svelte/transition';

	const icons = [Step1, Step2, Step3, Step4, Step5];

	let limitedSteps: { step: string; icon: typeof Step1 }[] = [];
	let progress = 0;
	$: progress = calculateProgress(currentStep, limitedSteps.length);
	$: limitedSteps = steps.slice(0, 5).map((step, index) => ({
		step,
		icon: icons[index % icons.length]
	}));

	let dropdownOpen = false;
	let slideDirection: 'left' | 'right' = 'right';
	let viewMode: 'Large' | 'Small' = 'Large';

	const calculateProgress = (current: number, total: number): number => {
		if (total <= 1) return 100;
		return Math.min(((current - 1) / (total - 1)) * 100, 100);
	};

	export let onStepChange: (event: { step: number }) => void = () => {};

	const navigateToStep = (stepIndex: number, direction: 'left' | 'right') => {
		slideDirection = direction;
		currentStep = stepIndex + 1;
		onStepChange({ step: currentStep });
		localStorage.setItem('currentStep', currentStep.toString());
	};

	const toggleView = (mode: 'Large' | 'Small') => {
		viewMode = mode;
		dropdownOpen = false;
		console.log('View mode updated to:', viewMode); // Debugging
	};
	let screenWidth: number = window.innerWidth;
	$: {
		if (screenWidth <= 480 && viewMode !== 'Small') {
			viewMode = 'Small';
		} else if (screenWidth > 480 && screenWidth <= 1145 && viewMode !== 'Small') {
			viewMode = 'Small';
		} else if (screenWidth > 1145 && viewMode !== 'Large') {
			viewMode = 'Large';
		}
	}

	// Add event listener for window resize
	const updateScreenWidth = () => {
		screenWidth = window.innerWidth;
	};

	// Lifecycle hook for adding/removing event listeners
	import { onMount, onDestroy } from 'svelte';
	onMount(() => {
		window.addEventListener('resize', updateScreenWidth);
	});
	onDestroy(() => {
		window.removeEventListener('resize', updateScreenWidth);
	});
</script>

<div
	class={`bg-gradient-to-br from-gray-500 to-gray-400 dark:from-gray-700 p-6 shadow-lg rounded-lg relative ${
		viewMode === 'Small' ? 'w-1/2' : 'w-full'
	} my-3`}
>

	<div class="relative">
		{#if viewMode === 'Large'}
			<!-- Step Icons -->
			<div
				class="relative bg-gray-300 my-5 rounded-full h-2 mx-auto"
				style="width: calc(100% - 2 * (100% / {limitedSteps.length} / 2));"
			>
				<div
					class="absolute top-0 left-0 h-2 bg-green-100 rounded-full transition-all duration-300"
					style="width: {progress}%;"
				></div>
			</div>

			<!-- Step Icons and Labels -->
			<div class="absolute top-2 left-0 transform -translate-y-1/2 w-full flex justify-between">
				{#each limitedSteps as { step, icon: Icon }, index}
					<div
						class="flex flex-col items-center"
						style="width: calc(100% / {limitedSteps.length});"
					>
						<button
							class="relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
							class:bg-green-200={index + 1 === currentStep}
							class:bg-green-100={index + 1 < currentStep}
							class:bg-gray-300={index + 1 > currentStep}
							tabindex="0"
							aria-label={`Navigate to step ${index + 1}`}
							onclick={() => {
								const direction = index + 1 < currentStep ? 'left' : 'right';
								navigateToStep(index, direction);
							}}
						>
							<img src={Icon} alt={step} class="size-5" />
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Small View Navigation -->
			<div class="relative flex items-center justify-between text-dark dark:text-light mt-5">
				<!-- Left Navigation Button -->
				<button
					aria-label="left-navigation"
					onclick={() => {
						if (currentStep > 1) navigateToStep(currentStep - 2, 'left');
					}}
					disabled={currentStep === 1}
					class={`p-2 rounded-full ${
						currentStep === 1
							? 'text-gray-300 cursor-not-allowed'
							: 'text-dark dark:text-light hover:bg-gray-400 dark:hover:bg-dark'
					}`}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-8"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
					</svg>
				</button>

				<!-- Current Step Icon -->
				<div
					class="relative w-10 h-10 flex items-center justify-center bg-green-200 rounded-full overflow-hidden"
				>
					{#key currentStep}
						<img
							src={limitedSteps[currentStep - 1]?.icon}
							alt={limitedSteps[currentStep - 1]?.step}
							class="absolute size-6"
							transition:fly={{ x: slideDirection === 'left' ? -100 : 100, duration: 300 }}
						/>
					{/key}
				</div>

				<!-- Right Navigation Button -->
				<button
					aria-label="right-navigation"
					onclick={() => {
						if (currentStep < limitedSteps.length) navigateToStep(currentStep, 'right');
					}}
					disabled={currentStep === limitedSteps.length}
					class={`p-2 rounded-full ${
						currentStep === limitedSteps.length
							? 'text-gray-300 cursor-not-allowed'
							: 'text-dark dark:text-light hover:bg-gray-400 dark:hover:bg-dark'
					}`}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-8"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
					</svg>
				</button>
			</div>
		{/if}
	</div>
	<!-- Steps Text -->
	<div class="flex justify-between mt-6">
		{#if viewMode === 'Large'}
			{#each limitedSteps as { step }, index}
				<div
					class={`text-center text-sm font-medium ${
						index + 1 === currentStep
							? 'text-green-200'
							: index + 1 < currentStep
								? 'text-green-100'
								: 'text-gray-100 dark:text-gray-300'
					}`}
					style="width: calc(100% / {limitedSteps.length});"
				>
					<span>{step}</span>
				</div>
			{/each}
		{:else}
			<div class="text-center text-sm font-medium text-green-200 w-full">
				<span>{limitedSteps[currentStep - 1]?.step || `Step ${currentStep}`}</span>
			</div>
		{/if}
	</div>
</div>
