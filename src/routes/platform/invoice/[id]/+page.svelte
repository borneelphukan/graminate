<script lang="ts">
	let invoiceNumber = 1;
	let date: string = '';
	let paymentTerms: string = '';
	let dueDate: string = '';
	let poNumber: string = '';
	let items: { description: string; quantity: number; rate: number; amount: number }[] = [
		{ description: '', quantity: 1, rate: 0, amount: 0 }
	];
	let notes = '';
	let terms = '';
	let tax = 0;
	let discount = 0;
	let shipping = 0;
	let amountPaid = 0;

	function calculateAmounts() {
		const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
		const taxAmount = (subtotal * tax) / 100;
		const total = subtotal + taxAmount - discount + shipping;
		const balanceDue = total - amountPaid;

		return { subtotal, total, balanceDue };
	}
</script>

<div class="container mx-auto p-6">
	<div class="border border-gray-300 rounded-lg shadow-md p-6">
		<div class="flex justify-between items-center">
			<div class="space-y-4"></div>
			<div class="text-right">
				<h1 class="text-4xl font-bold">INVOICE</h1>

				<input
					type="number"
					bind:value={invoiceNumber}
					placeholder="#"
					class="border rounded w-16 px-4 py-2 mt-2 text-right focus:outline-none focus:ring"
				/>
			</div>
		</div>

		<div class="grid grid-cols-3 gap-4 mt-6">
			<div>
				<label>Bill To</label>
				<input
					type="text"
					placeholder="Who is this to?"
					class="border rounded w-full px-4 py-2 mt-2 focus:outline-none focus:ring"
				/>
			</div>
			<div>
				<label>Ship To</label>
				<input
					type="text"
					placeholder="(optional)"
					class="border rounded w-full px-4 py-2 mt-2 focus:outline-none focus:ring"
				/>
			</div>
			<div>
				<label>Date</label>
				<input
					type="date"
					bind:value={date}
					class="border rounded w-full px-4 py-2 mt-2 focus:outline-none focus:ring"
				/>
			</div>
		</div>

		<div class="grid grid-cols-3 gap-4 mt-4">
			<div></div>
			<div></div>
			<div class="space-y-4">
				<div>
					<label>Payment Terms</label>
					<input
						type="text"
						bind:value={paymentTerms}
						class="border rounded w-full px-4 py-2 mt-2 focus:outline-none focus:ring"
					/>
				</div>
				<div>
					<label>Due Date</label>
					<input
						type="date"
						bind:value={dueDate}
						class="border rounded w-full px-4 py-2 mt-2 focus:outline-none focus:ring"
					/>
				</div>
				<div>
					<label>PO Number</label>
					<input
						type="text"
						bind:value={poNumber}
						class="border rounded w-full px-4 py-2 mt-2 focus:outline-none focus:ring"
					/>
				</div>
			</div>
		</div>

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
		<button
			on:click={() => items.push({ description: '', quantity: 1, rate: 0, amount: 0 })}
			class="mt-4 bg-green-500 text-white px-4 py-2 rounded focus:outline-none hover:bg-green-600"
		>
			+ Line Item
		</button>

		<div class="grid grid-cols-2 gap-4 mt-6">
			<textarea
				bind:value={notes}
				placeholder="Notes - any relevant information not already covered"
				class="border rounded w-full px-4 py-2 focus:outline-none focus:ring"
			></textarea>
			<textarea
				bind:value={terms}
				placeholder="Terms and conditions - late fees, payment methods, delivery schedule"
				class="border rounded w-full px-4 py-2 focus:outline-none focus:ring"
			></textarea>
		</div>

		<div class="grid grid-cols-3 gap-4 mt-6">
			<div></div>
			<div class="text-right space-y-2">
				<div>Subtotal: ₹{calculateAmounts().subtotal.toFixed(2)}</div>
				<div>
					Tax:
					<input
						type="number"
						bind:value={tax}
						class="w-12 text-right border rounded px-2 focus:outline-none"
					/>
					%
				</div>
				<div>
					Discount:
					<input
						type="number"
						bind:value={discount}
						class="w-16 text-right border rounded px-2 focus:outline-none"
					/>
				</div>
				<div>
					Shipping:
					<input
						type="number"
						bind:value={shipping}
						class="w-16 text-right border rounded px-2 focus:outline-none"
					/>
				</div>
			</div>
			<div class="text-right space-y-2">
				<div>Total: ₹{calculateAmounts().total.toFixed(2)}</div>
				<div>
					Amount Paid:
					<input
						type="number"
						bind:value={amountPaid}
						class="w-16 text-right border rounded px-2 focus:outline-none"
					/>
				</div>
				<div>Balance Due: ₹{calculateAmounts().balanceDue.toFixed(2)}</div>
			</div>
		</div>
	</div>
</div>
