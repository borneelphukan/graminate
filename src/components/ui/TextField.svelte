<script>
	export let label = '';
	export let placeholder = '';
	export let error_message = "That's an error!";
	export let isDisabled = false;
	export let type = ''; // "success", "error", "disabled"
	export let icon = ''; // "left", "right"
	export let calendar = false;
	export let password = false;
	export let value = '';
	export let width = '';

	let fieldClass = '';
	let iconPos = '';
	let iconColor = '';
	let widthClass = 'w-auto';

	const getFieldClass = () => {
		switch (type) {
			case 'error':
				return 'border border-gray-400 text-gray-100 placeholder-gray-300 text-sm rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-red-200';
			case 'disabled':
				return 'border border-gray-400 opacity-50 text-gray-100 placeholder-gray-300 text-sm rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-red-200 ';
			default:
				return 'border border-gray-400 dark:border-gray-200 text-gray-100 placeholder-gray-300 text-sm dark:bg-gray-700 dark:text-light rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-green-200';
		}
	};

	const getWidthClass = () => {
		switch (width) {
			case 'small':
				return 'w-1/4';
			case 'medium':
				return 'w-1/2';
			case 'large':
				return 'w-full';
			default:
				return 'w-auto';
		}
	};

	$: fieldClass = `${getFieldClass()} py-1 px-2 rounded`;
	$: iconPos = icon === 'left' ? 'left' : icon === 'right' ? 'right' : '';
	$: iconColor = type === 'error' ? 'text-red-200' : 'text-gray-300';
	$: widthClass = getWidthClass();
</script>

<div class="w-full {widthClass}">
	<label
		for={calendar ? 'calendar' : password ? 'password' : 'text'}
		class="block mb-1 text-sm font-medium text-gray-200 dark:text-gray-300"
	>
		{label}
	</label>
	<div class="relative flex items-center">
		<input
			class="{fieldClass} {iconPos === 'left' ? 'pl-10' : iconPos === 'right' ? 'pr-10' : ''}"
			disabled={isDisabled}
			type={calendar ? 'date' : password ? 'password' : 'text'}
			id={calendar ? 'calendar' : password ? 'password' : 'text'}
			{placeholder}
			bind:value
		/>

		{#if iconPos === 'left'}
			<span class="absolute inset-y-0 left-0 flex items-center pl-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="w-5 h-5 {iconColor}"
				>
					<path
						d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z"
					/>
					<path
						d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z"
					/>
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
					<path
						d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z"
					/>
					<path
						d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z"
					/>
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
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1-18 0Zm-9-3.75h.008v.008H12V8.25Z"
					/>
				</svg>
			</span>
			<p class="text-sm text-red-200">{error_message}</p>
		</div>
	{/if}
</div>
