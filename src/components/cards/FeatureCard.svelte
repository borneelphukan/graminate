<script>
	export let feature;
</script>

<div class="flex flex-col">
	<dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-200">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="h-6 w-6"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d={feature.icon} />
		</svg>
		{feature.title}
	</dt>
	<dd class="mt-4 text-base leading-7 text-gray-200">
		{#each feature.description as text}
			<p class="mb-4">{text}</p>
		{/each}
	</dd>
</div>
