<script lang="ts">
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import Dropdown from '../../../../components/ui/Dropdown.svelte';
	import TextField from '../../../../components/ui/TextField.svelte';

	const view = derived(page, ($page) => $page.url.searchParams.get('view') || 'profile');
	let languages = ['English', 'German', 'French', 'Spanish'];
	let countries = ['India', 'Bangladesh', 'Myanmar', 'Thailand', 'Pakistan'];
	let selectedLanguage = 'English';
	let selectedFormat = 'India';
	let firstName = 'Borneel Bikash';
	let lastName = 'Phukan';
	let selectedFile: File | null = null;

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			selectedFile = input.files[0];
			console.log('File selected:', selectedFile.name);
			// Add your logic to handle the file (e.g., upload to the server or display a preview)
		}
	}

	function triggerFileUpload() {
		const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
		if (fileInput) {
			fileInput.click();
		}
	}
</script>

<div class="py-6">
	{#if $view === 'profile'}
		<!-- Profile Section -->
		<div class="border-gray-300 rounded-lg">
			<h2 class="text-lg font-semibold mb-4">Global</h2>
			<p class="text-gray-300 mb-6">This applies across your FarmHub account.</p>

			<!-- Profile Image -->
			<div class="mb-6">
				<label for="fileInput" class="block font-semibold text-gray-700 mb-2">Profile Image</label>
				<div class="flex items-center">
					<!-- svelte-ignore a11y_img_redundant_alt -->
					<img
						src="https://eu.ui-avatars.com/api/?name=Borneel+Phukan&size=250"
						alt="User profile picture of Borneel Phukan"
						class="w-16 h-16 rounded-full border border-gray-400"
					/>
					<button
						class="ml-4 text-sm font-medium text-blue-600 hover:underline focus:outline-none"
						onclick={triggerFileUpload}
					>
						Upload
					</button>
					<input
						id="fileInput"
						type="file"
						class="hidden"
						accept="image/*"
						onchange={handleFileUpload}
					/>
				</div>
				{#if selectedFile}
					<p class="mt-2 text-sm text-green-600">Selected File: {selectedFile.name}</p>
				{/if}
			</div>

			<!-- First Name -->
			<div class="mb-6">
				<TextField bind:value={firstName} label="First name" placeholder="Enter your first name" />
			</div>

			<!-- Last Name -->
			<div class="mb-6">
				<TextField bind:value={lastName} label="Last name" placeholder="Enter your last name" />
			</div>

			<!-- Language -->
			<div class="mb-6">
				<Dropdown
					bind:selectedItem={selectedLanguage}
					items={languages}
					label="Language"
					type="form"
					width="half"
					on:select={(e) => console.log('Selected language:', e.detail.item)}
				/>
			</div>

			<!-- Date, Time and Format -->
			<div class="mb-6">
				<Dropdown
					bind:selectedItem={selectedFormat}
					items={countries}
					label="Date, Time and Format"
					type="form"
					width="half"
					on:select={(e) => console.log('Selected format:', e.detail.item)}
				/>
			</div>
		</div>
	{/if}

	{#if $view === 'weather'}
		<!-- Weather Section -->
		<div class="border-gray-300 rounded-lg">
			<h2 class="text-lg font-semibold mb-4">Weather Settings</h2>
			<p class="text-gray-300 mb-6">This applies across your FarmHub account.</p>
		</div>
	{/if}

	{#if $view === 'milestones'}
		<!-- Milestones Section -->
		<div class="border-gray-300 rounded-lg">
			<h2 class="text-lg font-semibold mb-4">Milestones Settings</h2>
			<p class="text-gray-300 mb-6">This changes your farming steps and sets your milestones.</p>
		</div>
	{/if}

	{#if $view === 'calendar'}
		<!-- Calendar Section -->
		<div class="border-gray-300 rounded-lg">
			<h2 class="text-lg font-semibold mb-4">Calendar Settings</h2>
			<p class="text-gray-300 mb-6">This changes your calendar settings.</p>
		</div>
	{/if}

	{#if $view === 'tasks'}
		<!-- Tasks Section -->
		<div class="border-gray-300 rounded-lg">
			<h2 class="text-lg font-semibold mb-4">Tasks Settings</h2>
			<p class="text-gray-300 mb-6">This changes your task settings.</p>
		</div>
	{/if}

	{#if $view === 'security'}
		<!-- Email Section -->
		<div class="mt-8">
			<p>Security section</p>
		</div>
	{/if}
</div>
