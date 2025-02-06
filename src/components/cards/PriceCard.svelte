<script lang="ts">
	export let label: string;
	export let description: string;
	export let price: string;
	export let priceSuffix: string;
	export let points: string[];
	export let href: string;
	export let popular: boolean = false;
	export let isSelected: boolean;
	export let onClick: () => void;

	function classNames(...classes: string[]) {
		return classes.filter(Boolean).join(' ');
	}
</script>

<div
	on:click={onClick}
	class={classNames(
		isSelected ? 'ring-2 ring-green-200' : 'ring-1 ring-gray-400 dark:gray-900',
		'rounded-3xl p-8 xl:p-10 cursor-pointer transform transition-transform duration-200 hover:scale-105'
	)}
	role="button"
	tabindex="0"
	on:keypress={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			onClick();
		}
	}}
>
	<div class="flex items-center justify-between gap-x-4">
		<h2 class="text-lg font-semibold leading-8 text-gray-200">
			{label}
		</h2>
		{#if popular}
			<span
				class="rounded-full bg-blue-200 px-2.5 py-1 text-xs font-semibold leading-5 text-white"
			>
				Most Popular
			</span>
		{/if}
	</div>
	<p class="mt-4 text-sm leading-6 text-gray-300">{description}</p>
	<p class="mt-6 flex items-baseline gap-x-1">
		<span class="text-4xl font-semibold tracking-tight text-black dark:text-white">
			{price}
		</span>
		<span class="text-sm font-semibold leading-6 text-gray-300">
			{priceSuffix}
		</span>
	</p>
	<a
		{href}
		class={classNames(
			isSelected
				? 'bg-green-200 text-white shadow-sm hover:bg-green-100 '
				: 'bg-gray-500 dark:bg-white/10 text-black dark:text-white hover:bg-gray-400 focus-visible:outline-white',
			'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
		)}
	>
		Buy plan
	</a>
	<ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10">
		{#each points as point}
			<li class="flex gap-x-3">
				<span class="text-green-400">✔</span>
				{point}
			</li>
		{/each}
	</ul>
</div>
