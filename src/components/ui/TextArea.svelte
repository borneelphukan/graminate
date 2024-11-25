<script>
	export let label = '';
	export let error_message = "That's an error!";
	export let isDisabled = false;
	export let type = ''; // "success", "error", "disabled"
	export let icon = ''; // "left", "right"

	let fieldClass = '';
	let iconPos = '';
	let iconColor = '';

	const getFieldClass = () => {
		switch (type) {
			case 'error':
				return 'border border-gray-400 text-gray-100 placeholder-gray-300 text-sm rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-red-200';
			case 'disabled':
				return 'border border-gray-400 opacity-50 text-gray-100 placeholder-gray-300 text-sm rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-red-200';
			default:
				return 'border border-gray-400 text-gray-100 placeholder-gray-300 text-sm rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-green-200';
		}
	};

	$: fieldClass = `${getFieldClass()} py-2 px-4 rounded`;
	$: iconPos = icon === 'left' ? 'left' : icon === 'right' ? 'right' : '';
	$: iconColor = type === 'error' ? 'text-red-200' : 'text-gray-300';
</script>

<div class="w-full">
	<label for="textarea" class="block mb-1 text-sm font-medium text-gray-200 dark:text-gray-300"
		>{label}</label
	>
	<div class="relative flex items-start">
		<textarea
			class="{fieldClass} {iconPos === 'left' ? 'pl-10' : iconPos === 'right' ? 'pr-10' : ''}"
			disabled={isDisabled}
			id="textarea"
			rows="3"
		></textarea>
		{#if iconPos === 'left'}
			<span class="absolute inset-y-0 left-0 flex items-center pl-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="w-5 h-5 {iconColor}"
				>
					<path d="..." /> <!-- Your icon paths here -->
				</svg>
			</span>
		{/if}
		{#if iconPos === 'right'}
			<span class="absolute inset-y-0 right-0 flex items-center pr-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="w-5 h-5 {iconColor}"
				>
					<path d="..." /> <!-- Your icon paths here -->
				</svg>
			</span>
		{/if}
	</div>
	{#if type === 'error'}
		<div class="flex items-center mt-1">
			<span class="font-medium mr-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6 text-red-200"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="..." /> <!-- Your icon paths here -->
				</svg>
			</span>
			<p class="text-sm text-red-200">{error_message}</p>
		</div>
	{/if}
</div>
