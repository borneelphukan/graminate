<script>
	export let label = '';
	export let isDisabled = false;
	export let type = '';
	export let placeholder;
	export let value = '';

	let fieldClass = '';

	const getFieldClass = () => {
		switch (type) {
			case 'disabled':
				return 'border border-gray-400 opacity-50 text-gray-100 placeholder-gray-300 text-sm rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-red-200';
			default:
				return 'border border-gray-400 text-gray-100 placeholder-gray-300 text-sm rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-green-200';
		}
	};

	$: fieldClass = `${getFieldClass()} py-2 px-4 rounded`;
</script>

<div class="w-full">
	<label for="textarea" class="block mb-1 text-sm font-medium text-gray-200 dark:text-gray-300">
		{label}
	</label>
	<div class="relative flex items-start">
		<textarea
			class={fieldClass}
			disabled={isDisabled}
			{placeholder}
			id="textarea"
			rows="3"
			bind:value
		></textarea>
	</div>
</div>
