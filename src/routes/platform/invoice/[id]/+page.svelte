<!-- This is the edit page for an Invoice -->
<script lang="ts">
	import CustomTable from '../../../../components/tables/CustomTable.svelte';
	import Button from '../../../../components/ui/Button.svelte';
	import TextArea from '../../../../components/ui/TextArea.svelte';
	import TextField from '../../../../components/ui/TextField.svelte';
	import { writable } from 'svelte/store';

	function goBack() {
		history.back();
	}

	let invoiceNumber = 1;

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

	let invoiceValues = writable<Record<string, string>>({
		customer: '',
		shipTo: '',
		dateCreated: '',
		paymentTerms: '',
		dueDate: '',
		poNumber: ''
	});
</script>

<div class="mb-4">
	<Button text="Back" style="ghost" arrow="left" on:click={goBack} />
</div>
<div class="container mx-auto p-6">
	<div class="border border-gray-500 rounded-lg shadow-md p-6">
		<div class="flex justify-between items-center">
			<div class="space-y-4">
				<div
					class="w-40 h-24 border border-dashed border-gray-400 flex items-center justify-center"
				>
					<!-- Logo from Invoice Settings -->
				</div>
			</div>
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

		<div class="grid grid-cols-3 gap-6 mt-6">
			<!-- First Column: Bill To -->
			<div>
				<TextField
					label="Bill To"
					placeholder="Who is this to?"
					type="text"
					bind:value={$invoiceValues.customer}
				/>
			</div>

			<!-- Second Column: Ship To -->
			<div>
				<TextArea
					label="Ship To"
					placeholder="(optional)"
					type="text"
					bind:value={$invoiceValues.shipTo}
				/>
			</div>

			<!-- Third Column: Grouped Fields -->
			<div class="space-y-4">
				<div>
					<TextField label="Date" type="date" calendar bind:value={$invoiceValues.dateCreated} />
				</div>
				<div>
					<TextField label="Payment Terms" type="text" bind:value={$invoiceValues.paymentTerms} />
				</div>
				<div>
					<TextField label="Due Date" type="date" calendar bind:value={$invoiceValues.dueDate} />
				</div>
				<div>
					<TextField label="PO Number" bind:value={$invoiceValues.poNumber} />
				</div>
			</div>
		</div>

		<CustomTable bind:items />

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
