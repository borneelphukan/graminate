<script lang="ts">
	import Button from '../../components/ui/Button.svelte';

	interface Document {
		name: string;
		linksCreated: number;
		views: number;
		owner: string;
		lastUpdated: string;
	}

	const documents: Document[] = [
		{
			name: 'FarmHub.pdf',
			linksCreated: 0,
			views: 0,
			owner: 'Borneel Bikash Phukan',
			lastUpdated: 'Nov 25, 2024'
		}
	];

	const totalDocuments = 1;
	const maxDocuments = 5;

	// Reactive variable for managing checkbox state
	let selectAll = false;
	let selectedDocuments: boolean[] = Array(documents.length).fill(false);

	// Watch for changes in selectAll and update individual checkboxes
	$: if (selectAll) {
		selectedDocuments = Array(documents.length).fill(true);
	} else {
		selectedDocuments = Array(documents.length).fill(false);
	}
</script>

<div class="flex items-center justify-between px-4 py-2 border-b">
	<h2 class="text-lg font-medium">Documents</h2>

	<div class="flex justify-between items-center py-1 bg-white relative mb-4">
		<div class="flex gap-2">
			<Button text="New Folder" style="secondary" add />
			<Button text="Upload Document" style="primary" />
		</div>
	</div>
</div>

<div class="bg-white shadow-md rounded overflow-hidden">
	<div class="p-4">
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="border-b">
						<th class="py-2 px-3 w-8">
							<input
								type="checkbox"
								class="form-checkbox h-4 w-4 text-gray-600"
								bind:checked={selectAll}
							/>
						</th>
						<th class="py-2 px-3">Name</th>
						<th class="py-2 px-3">Links Created</th>
						<th class="py-2 px-3">Views</th>
						<th class="py-2 px-3">Owner</th>
						<th class="py-2 px-3">Last Updated</th>
					</tr>
				</thead>
				<tbody>
					{#each documents as document, i}
						<tr class="border-b hover:bg-gray-400">
							<td class="py-2 px-3">
								<input
									type="checkbox"
									class="form-checkbox h-4 w-4 text-gray-600"
									bind:checked={selectedDocuments[i]}
								/>
							</td>
							<td class="py-2 px-3 text-blue-500 underline">{document.name}</td>
							<td class="py-2 px-3">{document.linksCreated}</td>
							<td class="py-2 px-3">{document.views}</td>
							<td class="py-2 px-3">{document.owner}</td>
							<td class="py-2 px-3">{document.lastUpdated}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
