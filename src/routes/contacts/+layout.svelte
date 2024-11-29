<script lang="ts">
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';

	type View = 'contacts' | 'companies' | 'deals' | 'invoices' | 'tickets';
	const view = derived(page, ($page) => ($page.url.searchParams.get('view') as View) || 'contacts');

	export let data: { columns: string[]; rows: string[][] };
</script>

<div class="container mx-auto p-4">
	<slot />

	<table class="table-auto w-full border">
		<thead>
			<tr>
				{#each data.columns as column}
					<th class="p-2 border">{column}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data.rows as row}
				<tr>
					{#each row as cell}
						<td class="p-2 border">{cell}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
