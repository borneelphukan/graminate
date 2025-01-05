<script lang="ts">
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';
	import Button from '@ui/Button.svelte';
	import Swal from 'sweetalert2';
	import TicketModal from '@modals/TicketModal.svelte';
	import DropdownFilter from '@ui/Dropdown/DropdownFilter.svelte';
	import DropdownSmall from '@ui/Dropdown/DropdownSmall.svelte';
	import SearchBar from '@ui/SearchBar.svelte';
	import TextArea from '@ui/TextArea.svelte';
	import TextField from '@ui/TextField.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import plantIcon from '@icons/plant.svg';
	import ViewTable from '@tables/ViewTable.svelte';
	import TicketView from '@ui/Switch/TicketView.svelte';

	export const params = {};
	const projectTitle = $page.url.searchParams.get('title');
	const crop = $page.url.searchParams.get('crop');
	const budget = $page.url.searchParams.get('budget');

	const ProjectStatus = ['Active', 'On Hold', 'Completed'];

	let isListView = false;
	function toggleView(view: boolean) {
		isListView = view;
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
			tasks: [{ id: 'Task-1', title: 'Make Ticket section similar to Jira interface', type: '' }]
		},
		{
			id: '2',
			title: 'IN PROGRESS',
			tasks: [{ id: 'Task-2', title: 'Complete CRM entry forms', type: '' }]
		},
		{
			id: '3',
			title: 'DONE',
			tasks: [{ id: 'Task-3', title: 'Make landing page for FarmMate', type: '' }]
		}
	];

	const addingTask = writable<number | null>(null);
	const editingColumn = writable<number | null>(null);
	const dropdownOpen = writable<{ colIndex: number; taskIndex: number } | null>(null);
	const columnDropdownOpen = writable<number | null>(null);
	let isLabelPopupOpen = false;
	let newLabel = '';
	let selectedTaskId = '';
	let searchQuery = '';
	let newTaskTitle = '';
	let newTaskType = '';
	let totalTaskCount = 3;
	let dropdownItems = ['Finance', 'Maintenance', 'Research', 'Urgent'];
	let isAddingColumn = false;
	let newColumnTitle = '';
	let isTicketModalOpen: boolean = false;
	let activeColumnIndex: number | null = null;
	let filteredLabels: string[] = [];
	let showDropdown = false;

	function handleDropdownChange() {
		newLabel = newLabel.trim();
		if (!newLabel) {
			showDropdown = false;
			return;
		}

		filteredLabels = dropdownItems.filter((item) =>
			item.toLowerCase().includes(newLabel.toLowerCase())
		);

		showDropdown = filteredLabels.length > 0;
	}

	function handleInputChange() {
		const trimmedInput = newLabel.trim().toLowerCase();
		if (trimmedInput) {
			filteredLabels = dropdownItems.filter((item) => item.toLowerCase().includes(trimmedInput));
			showDropdown = filteredLabels.length > 0;
		} else {
			showDropdown = false;
		}
	}

	let selectedFilterLabels: string[] = [];

	function filterTasks(column: Column) {
		return column.tasks.filter((task) => {
			const taskLabels = task.type.split(', ').map((label) => label.trim());
			const matchesLabels =
				selectedFilterLabels.length === 0 ||
				selectedFilterLabels.some((label) => taskLabels.includes(label));
			const matchesSearch =
				!searchQuery.trim() ||
				task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				task.id.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesLabels && matchesSearch;
		});
	}

	function highlightText(text: string, query: string) {
		if (!query) return text;
		const regex = new RegExp(`(${query})`, 'gi');
		return text.replace(regex, '<mark class="bg-green-300">$1</mark>');
	}

	function handleDrop(event: { detail: { items: Column[] } }) {
		columns = event.detail.items;
	}

	function openLabelPopup(taskId: string) {
		selectedTaskId = taskId;
		isLabelPopupOpen = true;
		const task = columns
			.flatMap((column) => column.tasks)
			.find((task) => task.id === selectedTaskId);
		taskLabels = task?.type ? task.type.split(', ').map((label) => label.trim()) : [];
	}

	function toggleLabelPopup() {
		isLabelPopupOpen = !isLabelPopupOpen;
	}

	function addLabel() {
		const task = columns
			.flatMap((column) => column.tasks)
			.find((task) => task.id === selectedTaskId);
		taskLabels = task?.type ? task.type.split(', ').map((label) => label.trim()) : [];
		if (!dropdownItems.includes(newLabel.trim())) {
			dropdownItems = [...dropdownItems, newLabel.trim()];
		}
		columns = columns.map((column) => ({
			...column,
			tasks: column.tasks.map((task) =>
				task.id === selectedTaskId
					? {
							...task,
							type: task.type ? `${task.type}, ${newLabel.trim()}` : newLabel.trim()
						}
					: task
			)
		}));
	}

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
			columnLimits[activeColumnIndex] = newLimit;
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

		const id = `Task-${++totalTaskCount}`;
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

	function getTaskLabels(taskId: string): string[] {
		const task = columns.flatMap((column) => column.tasks).find((task) => task.id === taskId);
		return task?.type ? task.type.split(', ').map((label) => label.trim()) : [];
	}

	let taskLabels = getTaskLabels(selectedTaskId);
	let hasTasks = columns.some((column) => column.tasks.length > 0);
	$: hasTasks = columns.some((column) => column.tasks.length > 0);

	const headers = [
		{ label: '# Key' },
		{ label: 'Summary' },
		{ label: 'Status' },
		{ label: 'Labels' }
	];
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
	<div class="mb-4">
		<Button text="Back" style="ghost" arrow="left" on:click={goBack} />
	</div>

	<div class="p-2 mx-auto">
		<div class="flex justify-between items-center">
			<h2 class="text-md dark:text-light">Project / {projectTitle}</h2>
			<div class="flex justify-end items-center space-x-4">
				<!-- Crop -->
				<div class={`flex items-center bg-gray-400 dark:bg-gray-600 rounded-full overflow-hidden`}>
					<div
						class="bg-green-200 text-white rounded-full flex items-center justify-center w-8 h-8 flex-shrink-0"
					>
						<img src={plantIcon} alt="Plant Icon" class="w-6 h-6" />
					</div>
					<span class="text-dark dark:text-light text-sm mx-3">
						{crop}
					</span>
				</div>

				<!-- Status -->
				<DropdownSmall items={ProjectStatus} placeholder="Status" />

				<!-- Budget -->
				<div class={`flex items-center bg-gray-400 dark:bg-gray-600  rounded-full overflow-hidden`}>
					<div
						class="bg-green-200 text-white rounded-full flex items-center justify-center w-8 h-8 flex-shrink-0"
					>
						₹
					</div>
					<span class="text-dark dark:text-light text-sm mx-3">
						{budget}
					</span>
				</div>
			</div>
		</div>
		<h1 class="text-lg font-bold mt-2 mb-6 dark:text-light">TASK board</h1>
		<div class="flex justify-between items-center mb-4">
			<SearchBar mode="table" placeholder="Search Task or ID" bind:query={searchQuery} />

			{#if hasTasks}
				<div class="flex items-center gap-4 ml-auto">
					<DropdownFilter
						items={dropdownItems}
						direction="down"
						placeholder="Label"
						bind:selectedItems={selectedFilterLabels}
					/>

					{#if selectedFilterLabels.length > 0}
						<Button
							text="Clear filters"
							style="ghost"
							on:click={() => {
								selectedFilterLabels = [];
							}}
						/>
					{/if}
				</div>
			{/if}
			<TicketView {isListView} {toggleView} />
		</div>

		{#if isListView}
			<ViewTable {headers} {columns} {filterTasks} {searchQuery} />
		{:else}
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
											class="hover:bg-gray-500 px-4 py-2 rounded w-full text-left"
											on:click={() => openTicketModal(colIndex)}
										>
											Set column limit
										</button>
										<button
											class="hover:bg-gray-500 px-4 py-2 rounded w-full text-left"
											on:click={() => deleteColumn(colIndex)}
										>
											Delete
										</button>
									</div>
								{/if}
							</div>
						</div>
						<div class="space-y-4">
							{#each filterTasks(column) as task, taskIndex}
								<div class="bg-white p-3 rounded-md shadow-sm relative">
									<div class="flex flex-row items-start justify-between">
										<div class="mr-2 break-words max-w-xs">
											<p class="text-gray-200">
												{@html highlightText(task.title, searchQuery)}
											</p>
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
													class="absolute right-0 w-32 bg-white shadow rounded text-sm text-gray-800 z-10"
													on:click|stopPropagation
												>
													<button
														class="hover:bg-gray-500 px-4 py-1 rounded w-full text-left"
														on:click={() => openLabelPopup(task.id)}
													>
														Add Label
													</button>
													<button
														class="hover:bg-gray-500 px-4 py-2 rounded w-full text-left"
														on:click={() => deleteTask(colIndex, taskIndex)}
													>
														Delete
													</button>
												</div>
											{/if}
										</div>
									</div>
									<div class="flex justify-between items-end mt-2">
										<div class="flex flex-wrap gap-1">
											{#each task.type ? task.type.split(', ') : [] as label}
												<span
													class={`text-xs font-semibold text-white rounded px-2 py-1 ${
														{
															Finance: 'bg-green-100 ',
															Research: 'bg-blue-200',
															Maintenance: 'bg-yellow-200',
															Urgent: 'bg-red-200'
														}[label] || 'bg-gray-300'
													}`}
												>
													{label}
												</span>
											{/each}
										</div>
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
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
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
		{/if}
	</div>
	{#if isLabelPopupOpen}
		<div
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
			on:click|self={toggleLabelPopup}
		>
			<div class="bg-white dark:bg-slate-800 rounded-lg p-6 w-96 shadow-lg">
				<h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">
					Add labels to {selectedTaskId}
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
					Begin typing to find and create labels
				</p>
				<div class="mt-4 relative">
					<TextField
						type="text"
						placeholder="Labels"
						bind:value={newLabel}
						on:input={handleInputChange}
					/>
				</div>
				<div class="mt-4">
					<DropdownSmall
						items={dropdownItems}
						direction="up"
						placeholder="Task Type"
						bind:selected={newLabel}
						on:change={() => handleDropdownChange()}
					/>
				</div>
				<div class="flex justify-end gap-3 mt-6">
					<Button text="Cancel" style="ghost" on:click={toggleLabelPopup} />
					<Button
						text="Done"
						style="primary"
						isDisabled={!newLabel.trim() || taskLabels.includes(newLabel.trim())}
						on:click={() => {
							addLabel();
							toggleLabelPopup();
						}}
					/>
				</div>
			</div>
		</div>
	{/if}
</div>

<TicketModal
	isOpen={isTicketModalOpen}
	columnName={activeColumnIndex !== null ? columns[activeColumnIndex].title : ''}
	currentLimit="No limit set"
	on:save={saveColumnLimit}
	on:cancel={closeTicketModal}
/>
