<script lang="ts">
	import Button from '@ui/Button.svelte';
	import { goto } from '$app/navigation';

	export let position: string;
	export let type: string;
	export let mode: string;
	export let description: string;
	export let tasks: string[] = [];
	export let requirements: string[] = [];
	export let benefits: string[] = [];

	let showDetails = false;

	const applyForJob = () => {
		const formattedPosition = position.toLowerCase().replace(/\s+/g, '-'); // URL-friendly format
		const formattedType = type.toLowerCase().replace(/\s+/g, '-');
		const formattedMode = mode.toLowerCase().replace(/\s+/g, '-');

		goto(`/career/${formattedPosition}?type=${formattedType}&mode=${formattedMode}`);
	};
</script>

<div class="bg-white p-6 rounded-lg shadow-md flex flex-col">
	<div class="flex justify-between items-center">
		<h3 class="text-xl font-semibold text-gray-900">{position}</h3>
		<Button text="Apply" style="primary" on:click={applyForJob} />
	</div>
	<p class="text-gray-200 text-sm">{type} ⋅ {mode}</p>
	<p class="mt-2">{description}</p>

	<!-- Show More / Show Less Toggle -->
	<button
		class="mt-2 text-blue-600 hover:underline focus:outline-none"
		on:click={() => (showDetails = !showDetails)}
	>
		{showDetails ? 'Show less' : 'Show more'}
	</button>

	{#if showDetails}
		{#if tasks.length}
			<div class="mt-4">
				<h4 class="text-lg font-semibold text-gray-800">Tasks</h4>
				<ul class="list-disc list-inside text-gray-600">
					{#each tasks as task}
						<li>{task}</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if requirements.length}
			<div class="mt-4">
				<h4 class="text-lg font-semibold text-gray-800">Requirements</h4>
				<ul class="list-disc list-inside text-gray-600">
					{#each requirements as requirement}
						<li>{requirement}</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if benefits.length}
			<div class="mt-4">
				<h4 class="text-lg font-semibold text-gray-800">Benefits</h4>
				<ul class="list-disc list-inside text-gray-600">
					{#each benefits as benefit}
						<li>{benefit}</li>
					{/each}
				</ul>
			</div>
		{/if}
	{/if}
</div>
