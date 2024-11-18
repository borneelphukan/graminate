<script>
	export let text = 'Button';
	export let arrow = ''; // "up", "down", "left", "right"
	export let style = 'primary'; // "primary", "secondary", "ghost"
	export let isDisabled = false;
	export let add = false; // "Add" icon

	let buttonClass = '';
	let arrowIcon = '';
	let addIcon = '';

	const getButtonClass = () => {
		switch (style) {
			case 'delete':
				return 'bg-red-200 text-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 text-white justify-center ';
			case 'primary':
				return 'bg-green-200 text-sm hover:bg-green-100 disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 text-white justify-center ';
			case 'secondary':
				return 'bg-transparent text-sm disabled:text-gray-400 disabled:bg-transparent disabled:border-gray-300 hover:bg-green-300 hover:bg-teal-50 text-green-200 hover:text-green-200 border border-green-200 justify-center';
			case 'ghost':
				return 'bg-transparent text-sm  text-gray-200 justify-center disabled:text-gray-400 disabled:bg-transparent';
			default:
				return '';
		}
	};

	$: buttonClass = `${getButtonClass()} py-1 pl-3 pr-2 rounded rounded-md}`;

	// Define SVG path for arrows based on the direction
	$: arrowIcon = 
		arrow === 'up' ? 'M5 15l5-5 5 5' :           // Up arrow (inverted V)
		arrow === 'down' ? 'M5 11l5 5 5-5' :        // Down arrow (V)
		arrow === 'left' ? 'M15 19l-7-7 7-7' :      // Left arrow (<)
		arrow === 'right' ? 'M9 5l7 7-7 7' :        // Right arrow (>)
		'';

	// Add icon for "Add" functionality
	$: addIcon = add ? 'M12 4.5v15m7.5-7.5h-15' : '';
</script>

<!-- Button HTML -->
<button class="{buttonClass} {isDisabled} flex items-center" disabled={isDisabled} on:click>
	{#if add}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6 mr-2"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d={addIcon} />
		</svg>
	{/if}
	{#if arrow === 'left'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6 mr-2"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d={arrowIcon} />
		</svg>
	{/if}
	{text}
	{#if arrow === 'right' || arrow === 'up' || arrow === 'down'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6 ml-2"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d={arrowIcon} />
		</svg>
	{/if}
</button>
