<script lang="ts">
	import { derived, writable, type Readable } from 'svelte/store';
	import MeetingModal from '@modals/MeetingModal.svelte';
	import Table from '@tables/Table.svelte';
	import Button from '@ui/Button.svelte';

	interface Meeting {
		meetingName: string;
		organizer: string;
		type: string;
		duration: string;
		platform: string;
	}

	const meetings: Meeting[] = [
		{
			meetingName: 'Morning Meeting',
			organizer: 'Borneel Bikash Phukan',
			type: 'One-to-One',
			duration: '30 Minutes',
			platform: 'Google Meet'
		}
	];

	const columns = ['Meeting Name', 'Organizer', 'Type', 'Duration', 'Platform'];
	const rows = meetings.map((meet) => [
		meet.meetingName,
		meet.organizer,
		meet.type,
		meet.duration,
		meet.platform
	]);

	const data = { columns, rows };

	const currentPage = writable(1);
	const itemsPerPage = writable(25);
	const searchQuery = writable('');
	const filteredRows = writable(rows);

	$: {
		filteredRows.set(
			rows.filter((row) =>
				row.some((cell) => String(cell).toLowerCase().includes($searchQuery.toLowerCase()))
			)
		);
	}

	const paginationItems = ['25 per page', '50 per page', '100 per page'];
	const isModalOpen = writable(false);

	const openModal = () => {
		isModalOpen.set(true);
	};

	const closeModal = () => {
		isModalOpen.set(false);
	};

	function handleRowClick(row: any[]) {}

	const totalRecordCount: Readable<number> = derived(
		filteredRows,
		($filteredRows) => $filteredRows.length
	);
</script>

<div class="container mx-auto p-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-bold dark:text-light">Meetings</h2>
		<Button text="Create Meeting" style="primary" add on:click={openModal} />
	</div>
	<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{$totalRecordCount} Record(s)</p>

	<Table
		{data}
		{filteredRows}
		{currentPage}
		{itemsPerPage}
		{paginationItems}
		{searchQuery}
		totalRecordCount={$totalRecordCount}
		onRowClick={handleRowClick}
	/>
</div>

<!-- Render Modal -->
{#if $isModalOpen}
	<MeetingModal onClose={closeModal} />
{/if}
