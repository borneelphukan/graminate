<script lang="ts">
	import { writable } from 'svelte/store';
	import Button from '../../../components/ui/Button.svelte';
	import TextArea from '../../../components/ui/TextArea.svelte';
	import TextField from '../../../components/ui/TextField.svelte';
	import DropdownSmall from '../../../components/ui/Dropdown/DropdownSmall.svelte';
	import TicketModal from '../../../components/modals/TicketModal.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import Swal from 'sweetalert2';

	function handleDrop(event: { detail: { items: Column[] } }) {
		columns = event.detail.items;
	}

	type Task = {
		id: string;
		title: string;
		type: string;
	};

	type Column = {
		id: string;
		title: string;
		tasks: Task[];
	};

	let columns: Column[] = [
		{
			id: '1',
			title: 'TO DO',
			tasks: [{ id: 'FAR-1', title: 'Make Ticket section similar to Jira interface', type: 'feat' }]
		},
		{
			id: '2',
			title: 'IN PROGRESS',
			tasks: [{ id: 'FAR-2', title: 'Complete CRM entry forms', type: '' }]
		},
		{
			id: '3',
			title: 'DONE',
			tasks: [{ id: 'FAR-3', title: 'Make landing page for FarmMate', type: '' }]
		}
	];

	const addingTask = writable<number | null>(null);
	const editingColumn = writable<number | null>(null);
	const dropdownOpen = writable<{ colIndex: number; taskIndex: number } | null>(null);
	const columnDropdownOpen = writable<number | null>(null);
	let newTaskTitle = '';
	let newTaskType = '';
	let totalTaskCount = 3;
	let dropdownItems = ['Finance', 'Maintenance', 'Research', 'Urgent'];
	let isAddingColumn = false;
	let newColumnTitle = '';
	let isTicketModalOpen: boolean = false;
	let activeColumnIndex: number | null = null;

	const openTicketModal = (index: number) => {
		isTicketModalOpen = true;
		activeColumnIndex = index;
		columnDropdownOpen.set(null);
	};

	const closeTicketModal = () => {
		isTicketModalOpen = false;
		activeColumnIndex = null;
	};

	let columnLimits: Record<number, string> = {};

	const saveColumnLimit = (event: CustomEvent<string>) => {
		if (activeColumnIndex !== null) {
			const newLimit = event.detail.trim();
			columnLimits[activeColumnIndex] = newLimit; // Save the limit for the column
			console.log(`New limit for column ${columns[activeColumnIndex].title}: ${newLimit}`);
		}
		closeTicketModal();
	};

	function startAddingTask(index: number) {
		newTaskTitle = '';
		newTaskType = '';
		addingTask.set(index);
	}

	function addTask(index: number) {
		const columnLimit = parseInt(columnLimits[index] || '0', 10);

		if (columnLimit > 0 && columns[index].tasks.length >= columnLimit) {
			Swal.fire({
				title: 'Task Limit Reached',
				text: `Task limit reached for the column "${columns[index].title}".`,
				icon: 'warning',
				confirmButtonText: 'OK'
			});
			return;
		}

		if (!newTaskTitle.trim()) {
			Swal.fire({
				title: 'Error',
				text: 'Task title is required',
				icon: 'error',
				confirmButtonText: 'OK'
			});
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

	function deleteColumn(index: number) {
		columns = columns.filter((_, i) => i !== index);
		columnDropdownOpen.set(null);
	}

	function toggleDropdown(colIndex: number, taskIndex: number) {
		dropdownOpen.update((current) =>
			current && current.colIndex === colIndex && current.taskIndex === taskIndex
				? null
				: { colIndex, taskIndex }
		);
	}

	function toggleColumnDropdown(index: number) {
		columnDropdownOpen.update((current) => (current === index ? null : index));
	}

	function handlePageClick(event: MouseEvent) {
		const target = event.target as HTMLElement;

		// Check if the click was outside the ellipsis dropdown
		if (!target.closest('[aria-label="column-ellipsis"]')) {
			columnDropdownOpen.set(null);
		}
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
			Swal.fire({
				title: 'Error',
				text: 'Column title is required',
				icon: 'error',
				confirmButtonText: 'OK'
			});
			return;
		}

		const newColumn: Column = {
			id: `${Date.now()}`,
			title: newColumnTitle.trim(),
			tasks: []
		};

		columns = [...columns, newColumn];

		newColumnTitle = '';
		isAddingColumn = false;
	}

	function cancelColumn() {
		newColumnTitle = '';
		isAddingColumn = false;
	}

	function goBack() {
		history.back();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	on:click={() => {
		handlePageClick;
		addingTask.set(null);
		dropdownOpen.set(null);
		columnDropdownOpen.set(null);
		editingColumn.set(null);
	}}
	class="min-h-screen"
>
	<div class="mb-4"><Button text="Back" style="ghost" arrow="left" on:click={goBack} /></div>
	<div class="max-w-6xl mx-auto">
		<h2 class="text-md dark:text-light mb-4">Project / Project_Name</h2>
		<h1 class="text-lg font-bold mt-2 mb-6 dark:text-light">TASK board</h1>

		<div
			class="flex gap-3 overflow-x-auto scrollbar-hide pb-2 relative"
			use:dndzone={{ items: columns, flipDurationMs: 200 }}
			on:consider={handleDrop}
			on:finalize={handleDrop}
		>
			{#each columns as column, colIndex (column.id)}
				<div
					class="bg-gray-500 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-700 shadow rounded-lg p-2 relative flex-none w-1/4"
					style="flex-shrink: 0;"
					on:click|stopPropagation
				>
					<div class="flex justify-between items-center cursor-grab drag-handle">
						{#if $editingColumn === colIndex}
							<input
								type="text"
								class="text-sm dark:text-light mb-4 border-b-2 border-gray-300 w-full focus:outline-none"
								bind:value={column.title}
								on:blur={() => saveColumnTitle(colIndex, column.title)}
							/>
						{:else}
							<button
								type="button"
								class="text-sm dark:text-light text-gray-200 mb-4 cursor-pointer focus:outline-none"
								on:click={() => startEditingColumn(colIndex)}
							>
								{column.title}
								{#if columnLimits[colIndex]?.trim()}
									<span class="text-xs bg-gray-300 rounded p-1 text-gray-100 font-semibold ml-2">
										MAX: {columnLimits[colIndex]}
									</span>
								{/if}
							</button>
						{/if}
						<div class="relative">
							<button
								aria-label="column-ellipsis"
								class="dark:text-light"
								on:click={() => toggleColumnDropdown(colIndex)}
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
							{#if $columnDropdownOpen === colIndex}
								<div
									class="absolute right-0 bg-white w-36 shadow rounded text-sm text-gray-800 z-10"
									on:click|stopPropagation
								>
									<button
										class="hover:bg-gray-500 px-4 py-1 rounded w-full text-left"
										on:click={() => openTicketModal(colIndex)}
									>
										Set column limit
									</button>
									<button
										class="hover:bg-gray-500 px-4 py-1 rounded w-full text-left"
										on:click={() => deleteColumn(colIndex)}
									>
										Delete
									</button>
								</div>
							{/if}
						</div>
					</div>
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
													Finance: 'bg-green-100 ',
													Research: 'bg-blue-200',
													Maintenance: 'bg-yellow-200',
													Urgent: 'bg-red-200'
												}[task.type] || 'bg-gray-300'
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
							class="mt-2 p-2 rounded-lg overflow-visible"
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
									placeholder="Task Type"
									bind:selected={newTaskType}
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
								on:click={() => {
									if (
										!(
											columnLimits[colIndex] &&
											columns[colIndex].tasks.length >= parseInt(columnLimits[colIndex], 10)
										)
									) {
										startAddingTask(colIndex);
									}
								}}
								add
								width="large"
								isDisabled={!!columnLimits[colIndex] &&
									columns[colIndex].tasks.length >= parseInt(columnLimits[colIndex] || '0', 10)}
							/>
						</div>
					{/if}
				</div>
			{/each}

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
						class="w-full bg-gray-500 dark:bg-slate-800 dark:text-gray-400 p-2 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-slate-700"
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

<TicketModal
	isOpen={isTicketModalOpen}
	columnName={activeColumnIndex !== null ? columns[activeColumnIndex].title : ''}
	currentLimit="No limit set"
	on:save={saveColumnLimit}
	on:cancel={closeTicketModal}
/>
