<script lang="ts">
	export let steps: string[] = [];
	export let currentStep: number = 1;

	import HomeIcon from '../../icons/prepare.svg';
	import UserIcon from '../../icons/soil.svg';
	import SettingsIcon from '../../icons/plant.svg';
	import BellIcon from '../../icons/routine.svg';
	import StarIcon from '../../icons/harvest.svg';

	const icons = [HomeIcon, UserIcon, SettingsIcon, BellIcon, StarIcon];

	let limitedSteps: { step: string; icon: typeof HomeIcon }[] = [];
	$: limitedSteps = steps.slice(0, 5).map((step, index) => ({
		step,
		icon: icons[index % icons.length]
	}));

	let dropdownOpen = false;
	let viewMode: 'Large' | 'Small' = 'Large';

	const calculateProgress = (current: number, total: number): number => {
		if (total <= 1) return 100;
		return Math.min(((current - 1) / (total - 1)) * 100, 100);
	};

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const navigateToStep = (stepIndex: number) => {
		currentStep = stepIndex + 1;
		dispatch('stepChange', { step: currentStep });
		localStorage.setItem('currentStep', currentStep.toString());
	};

	const toggleView = (mode: 'Large' | 'Small') => {
		viewMode = mode;
		dropdownOpen = false;
	};
</script>

<div
	class={`bg-gradient-to-br from-gray-500 to-gray-400 p-6 shadow-lg rounded-lg relative ${
		viewMode === 'Small' ? 'w-1/2' : 'w-full'
	} my-3`}
>
	<!-- Dropdown Icon -->
	<div class="absolute top-2 right-2">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6 cursor-pointer text-gray-200"
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

		<!-- Dropdown Menu -->
		{#if dropdownOpen}
			<div class="absolute right-0 top-8 w-24 bg-white text-gray-100 shadow-lg rounded-md z-10">
				<ul>
					<li class="px-4 py-2">
						<button
							class="w-full text-left hover:bg-gray-500 cursor-pointer"
							aria-label="Switch to Large view"
							on:click={() => toggleView('Large')}
						>
							Large
						</button>
					</li>
					<li class="px-4 py-2">
						<button
							class="w-full text-left hover:bg-gray-500 cursor-pointer"
							aria-label="Switch to Small view"
							on:click={() => toggleView('Small')}
						>
							Small
						</button>
					</li>
				</ul>
			</div>
		{/if}
	</div>

	<!-- Progress Bar with Navigation -->
	<div class="relative">
		<!-- Step Icons -->
		{#if viewMode === 'Large'}
			<div class="relative h-2 bg-gray-300 rounded-full mt-5">
				<div
					class="absolute top-0 left-0 h-2 bg-green-100 rounded-full"
					style="width: {viewMode === 'Large'
						? calculateProgress(currentStep, limitedSteps.length)
						: calculateProgress(currentStep, 1)}%;"
				></div>
			</div>
			<div class="absolute top-2 transform -translate-y-1/2 w-full flex justify-between">
				{#each limitedSteps as { step, icon: Icon }, index}
					<div
						class="relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
						class:bg-green-200={index + 1 === currentStep}
						class:bg-green-100={index + 1 < currentStep}
						class:bg-gray-300={index + 1 > currentStep}
						tabindex="0"
						role="button"
						aria-label={`Navigate to step ${index + 1}`}
						on:click={() => navigateToStep(index)}
						on:keydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								navigateToStep(index);
								event.preventDefault();
							}
						}}
					>
						<img src={Icon} alt={step} class="size-5" />
					</div>
				{/each}
			</div>
		{:else}
			<!-- Small View Navigation -->
			<div class="relative flex items-center justify-between">
				<!-- Left Navigation Button -->
				<button
					class="flex items-center justify-center rounded-full text-gray-200"
					aria-label="Previous step"
					on:click={() => {
						if (currentStep > 1) navigateToStep(currentStep - 2);
					}}
					disabled={currentStep === 1}
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
				<div class="w-10 h-10 flex items-center justify-center bg-green-200 rounded-full">
					<img
						src={limitedSteps[currentStep - 1]?.icon}
						alt={limitedSteps[currentStep - 1]?.step}
						class="size-6"
					/>
				</div>

				<!-- Right Navigation Button -->
				<button
					class="flex items-center justify-center rounded-full text-gray-200"
					aria-label="Next step"
					on:click={() => {
						if (currentStep < limitedSteps.length) navigateToStep(currentStep);
					}}
					disabled={currentStep === limitedSteps.length}
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
								: 'text-gray-100'
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
