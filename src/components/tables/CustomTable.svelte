<script lang="ts">
	import Button from '@ui/Button.svelte';

	export let items: { description: string; quantity: number; rate: number; amount: number }[] = [
		{ description: '', quantity: 1, rate: 0, amount: 0 }
	];

	function addItem() {
		items = [...items, { description: '', quantity: 1, rate: 0, amount: 0 }];
	}
</script>

<div>
	<!-- Table -->
	<table class="w-full border-collapse border border-gray-300 dark:border-gray-200 mt-6">
		<thead>
			<tr class="bg-gray-800 text-light">
				<th class="border border-gray-300 dark:border-gray-200 px-4 py-2 text-left">Item</th>
				<th class="border border-gray-300 dark:border-gray-200 px-4 py-2">Quantity</th>
				<th class="border border-gray-300 dark:border-gray-200 px-4 py-2">Rate</th>
				<th class="border border-gray-300 dark:border-gray-200 px-4 py-2">Amount</th>
			</tr>
		</thead>
		<tbody>
			{#each items as item, index}
				<tr>
					<td class="border border-gray-300 dark:border-gray-200 px-4 py-2">
						<input
							type="text"
							bind:value={item.description}
							placeholder="Description of item/service..."
							class="w-full focus:outline-none bg-transparent dark:text-light"
						/>
					</td>
					<td class="border border-gray-300 dark:border-gray-200 p-2 text-center w-6">
						<input
							type="number"
							bind:value={item.quantity}
							min="1"
							on:input={() => (item.amount = item.quantity * item.rate)}
							class="focus:outline-none bg-transparent dark:text-light"
						/>
					</td>
					<td class="border border-gray-300 dark:border-gray-200 p-2 text-center w-6">
						<input
							type="number"
							bind:value={item.rate}
							min="0"
							on:input={() => (item.amount = item.quantity * item.rate)}
							class="focus:outline-none bg-transparent dark:text-light"
						/>
					</td>
					<td class="border border-gray-300 dark:border-gray-200 dark:text-light p-2 text-right">
						₹{item.amount.toFixed(2)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Add Line Item Button -->
	<div class="py-2">
		<Button text="+ Add Item" style="primary" on:click={addItem} />
	</div>
</div>
