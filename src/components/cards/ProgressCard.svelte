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

	const calculateProgress = (current: number, total: number): number => {
		if (total <= 1) return 100;
		return Math.min(((current - 1) / (total - 1)) * 100, 100);
	};

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const navigateToStep = (stepIndex: number) => {
		dispatch('stepChange', { step: stepIndex + 1 });
	};
</script>

<div class="w-full bg-gradient-to-br from-gray-500 to-gray-400 p-6 shadow-lg rounded-lg">
	<p class="text-sm font-medium text-gray-200 text-center mb-4">
		{limitedSteps[currentStep - 1]?.step || `Step ${currentStep}`}
	</p>

	<div class="relative">
		<div class="relative h-2 bg-gray-300 rounded-full">
			<div
				class="absolute top-0 left-0 h-2 bg-green-100 rounded-full"
				style="width: {calculateProgress(currentStep, limitedSteps.length)}%;"
			></div>
		</div>

		<div class="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			{#each limitedSteps as { step, icon: Icon }, index}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="relative w-8 h-8 rounded-full flex items-center justify-center"
					class:bg-green-200={index + 1 === currentStep}
					class:bg-green-100={index + 1 < currentStep}
					class:bg-gray-300={index + 1 > currentStep}
					on:click={() => navigateToStep(index)}
				>
					<img src={Icon} alt={step} class="size-5" />
				</div>
			{/each}
		</div>
	</div>

	<div class="flex justify-between mt-6">
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
	</div>
</div>
