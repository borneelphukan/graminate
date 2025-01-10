<script lang="ts">
	export let placeholder: string = 'Add a description...';
	export let value: string = '';
	export let rows: number = 4;
	export let onInput: (value: string) => void = () => {};
	export let descriptionId: string | null = null;
	let isFocused = false;
	let tempValue = '';

	function handleFocus() {
		isFocused = true;
		tempValue = value;
	}

	function handleBlur() {
		setTimeout(() => {
			if (!tempValue && !value) {
				isFocused = false;
			}
		}, 200);
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement | null;
		if (target) {
			tempValue = target.value;
		}
	}

	async function handleSave() {
		try {
			const response = await fetch(
				descriptionId ? `/api/descriptions/${descriptionId}` : `/api/descriptions`,
				{
					method: descriptionId ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ description: tempValue })
				}
			);

			if (!response.ok) {
				throw new Error('Failed to save the description');
			}

			value = tempValue;
			onInput(value);
			isFocused = false;
		} catch (error) {
			console.error('Error saving description:', error);
			alert('Endpoint Doesnt exist until now.');
		}
	}

	function handleCancel() {
		tempValue = value;
		isFocused = false;
	}
</script>

<div class="relative w-full">
	{#if isFocused}
		<!-- Text Area -->
		<textarea
			class="w-full border border-gray-300 p-3 text-sm rounded shadow-sm resize-none"
			bind:value={tempValue}
			{rows}
			placeholder="Add your description here"
			on:input={handleInput}
			on:focus={handleFocus}
			on:blur={handleBlur}
		></textarea>

		<!-- Action Buttons -->
		<div class="flex gap-2 mt-2">
			<button
				class="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 focus:outline-none"
				on:click={handleSave}
			>
				Save
			</button>
			<button
				class="px-4 py-2 bg-gray-400 text-gray-700 text-sm rounded hover:bg-gray-500 focus:outline-none"
				on:click={handleCancel}
			>
				Cancel
			</button>
		</div>
	{:else}
		<!-- Placeholder -->
		<div
			class="relative w-full p-3 text-sm text-gray-300 hover:bg-gray-50 rounded cursor-text"
			role="button"
			tabindex="0"
			aria-label="Edit description"
			on:click={() => (isFocused = true)}
			on:keydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					isFocused = true;
				}
			}}
		>
			{placeholder}
		</div>
	{/if}
</div>
