<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '@ui/Button.svelte';
	import TextField from '@ui/TextField.svelte';

	export let isOpen: boolean = false;
	export const columnName: string = '';
	export let currentLimit: string = 'No limit set';

	let newLimit: string = '';

	const dispatch = createEventDispatcher();

	const handleSave = () => {
		dispatch('save', newLimit || currentLimit);
	};

	const handleCancel = () => {
		dispatch('cancel');
	};

	const clearLimit = () => {
		newLimit = '';
	};
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		aria-labelledby="modal-title"
		aria-hidden="true"
	>
		<div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-96">
			<div class="p-6">
				<h2 id="modal-title" class="text-lg font-bold text-gray-800 dark:text-light">
					Column limit
				</h2>
				<p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
					Set a limit to the number of tasks that can be added to this column.
				</p>

				<div class="mt-4 flex flex-1 flex-row items-center gap-1">
					<TextField
						label="Maximum tasks"
						placeholder="Set Limit"
						type="text"
						width="medium"
						bind:value={newLimit}
					/>

					{#if newLimit.trim()}
						<div class="mt-6">
							<Button text=" Reset" width="large" style="ghost" on:click={clearLimit} />
						</div>
					{/if}
				</div>
			</div>

			<div class="px-6 py-4 dark:bg-gray-800 flex justify-end gap-3">
				<Button text="Cancel" width="medium" style="ghost" on:click={handleCancel} />
				<Button text="Save" width="medium" style="primary" on:click={handleSave} />
			</div>
		</div>
	</div>
{/if}
