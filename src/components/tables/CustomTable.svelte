<script lang="ts">
	export let items: { description: string; quantity: number; rate: number; amount: number }[] = [
		{ description: '', quantity: 1, rate: 0, amount: 0 }
	];

	function addItem() {

		items = [...items, { description: '', quantity: 1, rate: 0, amount: 0 }];
	}
</script>

<div>
	<!-- Table -->
	<table class="w-full border-collapse border border-gray-300 mt-6">
		<thead>
			<tr class="bg-gray-200 text-light">
				<th class="border border-gray-300 px-4 py-2 text-left">Item</th>
				<th class="border border-gray-300 px-4 py-2">Quantity</th>
				<th class="border border-gray-300 px-4 py-2">Rate</th>
				<th class="border border-gray-300 px-4 py-2">Amount</th>
			</tr>
		</thead>
		<tbody>
			{#each items as item, index}
				<tr>
					<td class="border border-gray-300 px-4 py-2">
						<input
							type="text"
							bind:value={item.description}
							placeholder="Description of item/service..."
							class="w-full focus:outline-none"
						/>
					</td>
					<td class="border border-gray-300 px-4 py-2 text-center">
						<input
							type="number"
							bind:value={item.quantity}
							on:input={() => (item.amount = item.quantity * item.rate)}
							class="w-12 text-center focus:outline-none"
						/>
					</td>
					<td class="border border-gray-300 px-4 py-2 text-right">
						<input
							type="number"
							bind:value={item.rate}
							on:input={() => (item.amount = item.quantity * item.rate)}
							class="w-16 text-right focus:outline-none"
						/>
					</td>
					<td class="border border-gray-300 px-4 py-2 text-right">
						₹{item.amount.toFixed(2)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Add Line Item Button -->
	<button
		on:click={addItem}
		class="mt-4 bg-green-500 text-white px-4 py-2 rounded focus:outline-none hover:bg-green-600"
	>
		+ Add Item
	</button>
</div>
