<script lang="ts">
	import Table from '../../components/tables/Table.svelte';
	import Button from '../../components/ui/Button.svelte';
	import { writable } from 'svelte/store';
	import MeetingModal from '../../components/modals/MeetingModal.svelte';

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
	const totalRecordCount = rows.length;

	// Modal State
	const isModalOpen = writable(false);

	const openModal = () => {
		isModalOpen.set(true);
	};

	const closeModal = () => {
		isModalOpen.set(false);
	};
</script>

<div class="flex items-center justify-between border-b mb-4">
	<h2 class="text-lg font-bold">Meetings</h2>

	<div class="flex justify-between items-center py-1 bg-white relative mb-4">
		<div class="flex gap-2">
			<Button text="Create Meeting" style="primary" add on:click={openModal} />
		</div>
	</div>
</div>

<Table
	{data}
	{filteredRows}
	{currentPage}
	{itemsPerPage}
	{paginationItems}
	{searchQuery}
	{totalRecordCount}
/>

<!-- Render Modal -->
{#if $isModalOpen}
	<MeetingModal on:close={closeModal} />
{/if}
