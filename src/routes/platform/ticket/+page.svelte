<script lang="ts">
	import { writable } from 'svelte/store';
	import Button from '../../../components/ui/Button.svelte';
	import TextArea from '../../../components/ui/TextArea.svelte';
	import TextField from '../../../components/ui/TextField.svelte';
	import DropdownSmall from '../../../components/ui/Dropdown/DropdownSmall.svelte';

	type Task = {
		id: string;
		title: string;
		type: string;
	};

	type Column = {
		title: string;
		tasks: Task[];
	};

	let columns: Column[] = [
		{
			title: 'TO DO',
			tasks: [{ id: 'FAR-1', title: 'Make Ticket section similar to Jira interface', type: 'feat' }]
		},
		{
			title: 'IN PROGRESS',
			tasks: [{ id: 'FAR-2', title: 'Complete CRM entry forms', type: '' }]
		},
		{
			title: 'DONE',
			tasks: [{ id: 'FAR-3', title: 'Make landing page for FarmHub', type: '' }]
		}
	];

	const addingTask = writable<number | null>(null);
	const editingColumn = writable<number | null>(null);
	const dropdownOpen = writable<{ colIndex: number; taskIndex: number } | null>(null);
	let newTaskTitle = '';
	let newTaskType = '';
	let totalTaskCount = 3;
	let selectedTaskType = '';
	let dropdownItems = ['Finance', 'Management', 'Research', 'Urgent'];

	let isAddingColumn = false;
	let newColumnTitle = '';
	let labelOpen = false;

	function startAddingTask(index: number) {
		newTaskTitle = '';
		newTaskType = '';
		addingTask.set(index);
	}

	function addTask(index: number) {
		if (!newTaskTitle.trim()) {
			alert('Task title is required');
			return;
		}

		const id = `FAR-${++totalTaskCount}`;
		const newTask: Task = {
			id,
			title: newTaskTitle.trim(),
			type: newTaskType.trim() || ''
		};

		columns[index].tasks = [...columns[index].tasks, newTask];
		addingTask.set(null);
	}

	function deleteTask(colIndex: number, taskIndex: number) {
		columns[colIndex].tasks = columns[colIndex].tasks.filter((_, i) => i !== taskIndex);
		dropdownOpen.set(null);
	}

	function toggleDropdown(colIndex: number, taskIndex: number) {
		dropdownOpen.update((current) =>
			current && current.colIndex === colIndex && current.taskIndex === taskIndex
				? null
				: { colIndex, taskIndex }
		);
	}

	function startEditingColumn(index: number) {
		editingColumn.set(index);
	}

	function saveColumnTitle(index: number, newTitle: string) {
		if (newTitle.trim()) {
			columns[index].title = newTitle.trim();
		}
		editingColumn.set(null);
	}

	function addNewColumn() {
		if (!newColumnTitle.trim()) {
			alert('Column title is required');
			return;
		}

		columns = [
			...columns,
			{
				title: newColumnTitle.trim(),
				tasks: []
			}
		];

		newColumnTitle = '';
		isAddingColumn = false;
	}

	function cancelColumn() {
		// Reset the state for adding a new column
		newColumnTitle = ''; // Clear the input field
		isAddingColumn = false; // Close the create column section
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	on:click={() => {
		addingTask.set(null);
		dropdownOpen.set(null);
		editingColumn.set(null);
	}}
	class="min-h-screen"
>
	<div class="max-w-6xl mx-auto">
		<h2 class="text-sm">Project / Project_Name</h2>
		<h1 class="text-lg font-bold mt-2 mb-6">TASK board</h1>

		<!-- Add horizontal scrolling container -->
		<div class="flex gap-3 overflow-x-auto scrollbar-hide pb-2 relative">
			{#each columns as column, colIndex}
				<div
					class="bg-gray-500 shadow rounded-lg p-2 relative flex-none w-72"
					on:click|stopPropagation
				>
					{#if $editingColumn === colIndex}
						<input
							type="text"
							class="text-sm text-gray-900 mb-4 border-b-2 border-gray-300 w-full focus:outline-none"
							bind:value={column.title}
							on:blur={() => saveColumnTitle(colIndex, column.title)}
						/>
					{:else}
						<button
							type="button"
							class="text-sm text-gray-200 mb-4 cursor-pointer focus:outline-none"
							on:click={() => startEditingColumn(colIndex)}
						>
							{column.title}
						</button>
					{/if}
					<div class="space-y-4">
						{#each column.tasks as task, taskIndex}
							<div class="bg-white p-3 rounded-md shadow-sm relative">
								<div class="flex flex-row items-start justify-between">
									<div class="mr-2 break-words max-w-xs">
										<p class="text-gray-200">{task.title}</p>
									</div>
									<div class="relative">
										<button
											aria-label="ellipsis"
											on:click={() => toggleDropdown(colIndex, taskIndex)}
										>
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
													d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
												/>
											</svg>
										</button>
										{#if $dropdownOpen && $dropdownOpen.colIndex === colIndex && $dropdownOpen.taskIndex === taskIndex}
											<div
												class="absolute right-0 bg-white shadow rounded text-sm text-gray-800 z-10"
												on:click|stopPropagation
											>
												<button
													class="hover:bg-gray-500 px-4 py-1 rounded w-full text-left"
													on:click={() => deleteTask(colIndex, taskIndex)}
												>
													Delete
												</button>
											</div>
										{/if}
									</div>
								</div>
								<div class="flex justify-between items-end mt-2">
									{#if task.type}
										<span
											class={`text-xs font-semibold text-white rounded px-2 py-1 ${
												{
													Finance: 'bg-green-100 text-white',
													Research: 'bg-blue-300 text-blue-100',
													Maintenance: 'bg-yellow-300 text-yellow-100',
													Urgent: 'bg-red-300 text-red-100'
												}[task.type] || 'bg-gray-300 text-gray-100'
											}`}
										>
											{task.type}
										</span>
									{/if}
									<span class="text-xs text-gray-300 ml-auto">{task.id}</span>
								</div>
							</div>
						{/each}
					</div>
					{#if $addingTask === colIndex}
						<div
							class="mt-2 bg-gray-500 p-2 rounded-lg shadow-sm overflow-visible"
							style="box-sizing: border-box; max-width: 100%;"
						>
							<TextArea placeholder="What needs to be done?" bind:value={newTaskTitle} />
							<div
								class="mt-2 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 z-20"
							>
								<!-- Task Type Dropdown -->
								<DropdownSmall
									items={dropdownItems}
									direction="up"
									bind:selected={selectedTaskType}
								/>

								<!-- Create Button -->
								<Button text="Create" style="secondary" on:click={() => addTask(colIndex)} />
							</div>
						</div>
					{:else}
						<div class="mt-4 w-full py-2 mx-auto">
							<Button
								text="Create issue"
								style="primary"
								on:click={() => startAddingTask(colIndex)}
								add
								width="large"
							/>
						</div>
					{/if}
				</div>
			{/each}

			<!-- Add New Column Button -->
			<div class="rounded-lg flex-none flex flex-col items-center justify-top">
				{#if isAddingColumn}
					<div class="w-full">
						<TextField type="text" placeholder="Column title" bind:value={newColumnTitle} />
						<div class="flex flex-1 flex-row gap-2 items-end justify-end">
							<button
								aria-label="create"
								class="mt-2 bg-gray-300 text-white p-1 rounded-lg text-sm shadow-md"
								on:click={addNewColumn}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-6"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
								</svg>
							</button>
							<button
								aria-label="cancel"
								class="mt-2 bg-gray-300 text-white p-1 rounded-lg text-sm shadow-md"
								on:click={cancelColumn}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-6"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>
				{:else}
					<button
						aria-label="add"
						class="w-full bg-gray-500 text-gray-600 p-2 rounded-lg text-sm hover:bg-gray-400"
						on:click={() => {
							isAddingColumn = true;
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
