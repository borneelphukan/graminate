<!-- This is the edit page for an Invoice -->
<script lang="ts">
	import CustomTable from '@tables/CustomTable.svelte';
	import Button from '@ui/Button.svelte';
	import TextArea from '@ui/TextArea.svelte';
	import TextField from '@ui/TextField.svelte';
	import { writable } from 'svelte/store';
	import jsPDF from 'jspdf';
	import { page } from '$app/stores';

	let userId = $page.params.user_id;

	function goBack() {
		history.back();
	}

	function downloadInvoice() {
		const margin = 20; // Margin around the content
		const pageWidth = 595.28; // Standard A4 width in points
		const pageHeight = 841.89; // Standard A4 height in points
		const contentWidth = pageWidth - 2 * margin; // Available content width within margins

		const doc = new jsPDF({
			orientation: 'portrait',
			unit: 'pt',
			format: 'a4'
		});

		const element = document.querySelector('.container.mx-auto.p-6') as HTMLElement;

		if (element) {
			// Apply a max-width to the container for better layout
			element.style.maxWidth = `${contentWidth}px`;
			element.style.margin = '0 auto';

			doc.html(element, {
				callback: function (doc) {
					doc.save('Invoice.pdf'); // Save the PDF after rendering
				},
				x: margin, // Left margin
				y: margin, // Top margin
				html2canvas: {
					scale: 0.9, // Scale content slightly down
					useCORS: true // Allow cross-origin images and resources
				},
				width: contentWidth, // Content width fits within defined margins
				windowWidth: element.scrollWidth // Ensure all content is captured
			});
		} else {
			console.error('Invoice element not found');
		}
	}

	function sendAsEmail() {
		alert('Email functionality not implemented yet.');
	}

	let items: { description: string; quantity: number; rate: number; amount: number }[] = [
		{ description: '', quantity: 1, rate: 0, amount: 0 }
	];
	let tax = 0;
	let discount = 0;
	let shipping = 0;
	let amountPaid = 0;

	function calculateAmounts() {
		const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
		const taxAmount = Math.max(0, (subtotal * tax) / 100);
		const total = Math.max(0, subtotal + taxAmount - discount + shipping);
		const balanceDue = Math.max(0, total - amountPaid);

		return {
			subtotal: Math.max(0, subtotal),
			total,
			balanceDue
		};
	}

	let invoiceValues = writable<Record<string, string>>({
		invoiceNumber: '',
		customer: '',
		shipTo: '',
		dateCreated: '',
		paymentTerms: '',
		dueDate: '',
		poNumber: '',
		notes: ''
	});
</script>

<Button text="Back" style="ghost" arrow="left" on:click={goBack} />

<div class="container mx-auto p-6">
	<div class="border border-gray-400 dark:border-gray-200 rounded-lg p-6">
		<div class="flex justify-between items-center">
			<div class="space-y-4">
				<div
					class="w-40 h-24 border border-dashed border-gray-400 text-dark dark:text-light flex items-center justify-center"
				>
					<!-- Logo from Invoice Settings -->
					+ Logo
				</div>
			</div>
			<div class="text-right">
				<h1 class="text-4xl font-bold mb-4 text-dark dark:text-light">INVOICE</h1>
				<TextField
					type="number"
					label="Invoice No."
					placeholder="#"
					bind:value={$invoiceValues.invoiceNumber}
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

			<!-- Second Column: Shipping Address -->
			<div>
				<TextArea
					label="Shipping Address"
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
			</div>
		</div>

		<CustomTable bind:items />

		<div class="grid grid-cols-2 gap-12 mt-6 mr-6">
			<!-- Left Column: Notes and Terms -->
			<div class="space-y-2">
				<TextArea
					label="Notes"
					placeholder="Notes - any relevant information not already covered"
					bind:value={$invoiceValues.notes}
				/>
				<TextArea
					label="Terms"
					placeholder="Terms and conditions - late fees, payment methods, delivery schedule"
					bind:value={$invoiceValues.terms}
				/>
			</div>

			<!-- Right Column: Subtotal, Tax, Discount, Shipping, Total -->
			<div class="space-y-2">
				<div class="flex justify-between text-dark dark:text-light">
					<span>Subtotal: </span>
					<span class="font-semibold">₹{calculateAmounts().subtotal.toFixed(2)}</span>
				</div>
				<div class="flex justify-between text-dark dark:text-light">
					<span>Tax:</span>
					<div class="flex items-center">
						<!-- Tax input field -->
						<input
							type="number"
							bind:value={tax}
							min="0"
							class="w-16 border border-gray-400 dark:border-gray-200 text-gray-100 placeholder-gray-300 text-sm dark:bg-gray-700 dark:text-light rounded-md block p-1 focus:outline-none focus:ring-1 focus:ring-green-200"
						/>
						<span class="ml-1">%</span>
					</div>
				</div>
				<!-- Discount and Shipping -->
				<div class="flex justify-between text-dark dark:text-light">
					<div class="flex items-center gap-4">
						<span>Discount:</span>
						<input
							type="number"
							bind:value={discount}
							min="0"
							class="w-16 border border-gray-400 dark:border-gray-200 text-gray-100 placeholder-gray-300 text-sm dark:bg-gray-700 dark:text-light rounded-md block p-1 focus:outline-none focus:ring-1 focus:ring-green-200"
						/>
					</div>
					<div class="flex items-center gap-4">
						<span>Shipping:</span>
						<input
							type="number"
							bind:value={shipping}
							min="0"
							class="w-16 border border-gray-400 dark:border-gray-200 text-gray-100 placeholder-gray-300 text-sm dark:bg-gray-700 dark:text-light rounded-md block p-1 focus:outline-none focus:ring-1 focus:ring-green-200"
						/>
					</div>
				</div>
				<div class="flex justify-between text-dark dark:text-light">
					<span class="font-semibold">Total:</span>
					<span class="font-bold">₹{calculateAmounts().total.toFixed(2)}</span>
				</div>
				<div class="flex justify-between text-dark dark:text-light">
					<span>Amount Paid:</span>
					<input
						type="number"
						bind:value={amountPaid}
						min="0"
						class="w-16 border border-gray-400 dark:border-gray-200 text-gray-100 placeholder-gray-300 text-sm dark:bg-gray-700 dark:text-light rounded-md block p-1 focus:outline-none focus:ring-1 focus:ring-green-200"
					/>
				</div>
				<div class="flex justify-between text-dark dark:text-light">
					<span class="font-semibold">Balance Due:</span>
					<span class="font-bold">₹{calculateAmounts().balanceDue.toFixed(2)}</span>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="container flex justify-end mx-auto px-6 gap-2">
	<Button text="Download Invoice" style="primary" on:click={downloadInvoice} />
	<Button text="Send as Email" style="primary" on:click={sendAsEmail} />
</div>
