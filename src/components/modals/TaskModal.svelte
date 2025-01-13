<script lang="ts">
	import Button from '@ui/Button.svelte';
	import CustomTextArea from '@ui/CustomTextArea.svelte';
	import { onMount } from 'svelte';

	export let isOpen: boolean;
	export let taskDetails: { id: string; title: string };
	export let projectName: string | null;
	export let onClose: () => void;

	let isEditing = false;
	let editedTitle = taskDetails.title;
	let description: string = '';
	let existingDescriptionId: string | null = null;

	let isFlagged = false;
	let showDropdown = false;

	function closeModal() {
		if (onClose) onClose();
	}

	function startEditing() {
		isEditing = true;
	}

	function saveTitle() {
		isEditing = false;
		taskDetails.title = editedTitle;
		localStorage.setItem(`task-${taskDetails.id}`, editedTitle);
	}

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	function toggleFlag() {
		isFlagged = !isFlagged;
		showDropdown = false;
	}

	onMount(() => {
		const savedTitle = localStorage.getItem(`task-${taskDetails.id}`);
		if (savedTitle) {
			taskDetails.title = savedTitle;
			editedTitle = savedTitle;
		}
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 h-[80%] w-[1200px] shadow-lg relative">
			<!-- Ellipse Button and Cross Button -->
			<div class="absolute top-3 right-3 flex items-center space-x-2">
				<!-- Options Button -->
				<div class="relative">
					<button
						class="p-2 rounded-md hover:bg-gray-400 focus:outline-none"
						aria-label="Options"
						on:click={toggleDropdown}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
							/>
						</svg>
					</button>
					<!-- Dropdown -->
					{#if showDropdown}
						<div class="absolute right-0 mt-2 w-40 bg-white shadow-md rounded">
							<button
								class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-400"
								on:click={toggleFlag}
							>
								{isFlagged ? 'Remove Flag' : 'Add Flag'}
							</button>
						</div>
					{/if}
				</div>

				<!-- Close Button -->
				<button
					class="p-2 rounded-md hover:bg-gray-400 focus:outline-none"
					aria-label="Close"
					on:click={closeModal}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-5"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<p class="text-gray-300 text-sm">{projectName} / {taskDetails.id}</p>

			<div class="grid grid-cols-[60%_40%] gap-4 mt-4">
				<!-- Left Column -->
				<div>
					{#if isEditing}
						<input
							type="text"
							bind:value={editedTitle}
							class="text-gray-200 text-lg font-bold rounded-md w-full p-2"
							on:blur={saveTitle}
							on:keydown={(e) => e.key === 'Enter' && saveTitle()}
						/>
					{:else}
						<button
							class="w-full text-gray-200 text-lg hover:bg-gray-50 hover:cursor-pointer bg-transparent rounded-md p-0"
							on:click={startEditing}
						>
							<span class="flex p-2 font-bold">
								{taskDetails.title}
							</span>
						</button>
					{/if}
					<div class="mt-4">
						<p class="text-gray-200 font-bold text-md mb-2">Description</p>
						<CustomTextArea
							placeholder="Add your description here..."
							value={description}
							onInput={(val) => (description = val)}
							descriptionId={existingDescriptionId}
						/>
					</div>
				</div>

				<!-- Right Column -->
				<div>
					<div class="flex flex-row gap-4 justify-start items-center">
						<Button text="Update" style="primary" />
						{#if isFlagged}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
								/>
							</svg>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
