<script>
	export let label = '';
	export let placeholder = '';
	export let error_message = 'This cannot be left blank';
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
	let showPassword = false;

	const getFieldClass = () => {
		switch (type) {
			case 'error':
				return 'border border-red-200 text-gray-100 placeholder-gray-300 text-sm rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-red-200';
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

	const togglePasswordVisibility = () => {
		showPassword = !showPassword;
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
			type={calendar ? 'date' : password ? (showPassword ? 'text' : 'password') : 'text'}
			id={calendar ? 'calendar' : password ? 'password' : 'text'}
			{placeholder}
			bind:value
		/>

		{#if password}
			<button
				type="button"
				class="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
				on:click={togglePasswordVisibility}
				aria-label={showPassword ? 'Hide password' : 'Show password'}
			>
				{#if showPassword}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-4"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-4"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
						/>
					</svg>
				{/if}
			</button>
		{/if}
	</div>
	{#if type === 'error'}
		<div class="flex items-center mt-1">
			<span class="font-medium mr-1">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6 text-red-200"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
					/>
				</svg>
			</span>
			<p class="text-sm text-red-200">{error_message}</p>
		</div>
	{/if}
</div>
