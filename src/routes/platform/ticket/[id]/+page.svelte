<script lang="ts">
	import { selectedTicket } from '../../../../stores/ticketStore';

	import { get } from 'svelte/store';

	let ticketData = get(selectedTicket);
</script>

<div class="p-4">
	{#if ticketData}
		<button class="flex flex-row items-center mb-2" on:click={() => history.back()}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-5 h-5 mr-1"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
			</svg>
			Back
		</button>

		<h1 class="text-base font-bold">Ticket Details / {ticketData.name}</h1>
		<div class="bg-white p-4 rounded shadow">
			<p><strong>ID:</strong> {ticketData.id}</p>
			<p><strong>Name:</strong> {ticketData.name}</p>
			<p><strong>Crop Name:</strong> {ticketData.crop}</p>
			<p><strong>Status:</strong> {ticketData.status}</p>
			<p><strong>Date Created:</strong> {ticketData.dateCreated}</p>
			<p><strong>Duration:</strong> {ticketData.duration}</p>
		</div>
	{:else}
		<p>No ticket data available.</p>
	{/if}
</div>
