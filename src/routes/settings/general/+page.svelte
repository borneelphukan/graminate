<script lang="ts">
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import Dropdown from '../../../components/ui/Dropdown.svelte';
	import TextField from '../../../components/ui/TextField.svelte';
	const view = derived(page, ($page) => $page.url.searchParams.get('view') || 'profile');
	let languages = ['English', 'German', 'French', 'Spanish'];
	let countries = ['India', 'Bangladesh', 'Myanmar', 'Thailand', 'Pakistan'];
	let selectedLanguage = 'English';
	let selectedFormat = 'India';
	let firstName = 'Borneel Bikash';
	let lastName = 'Phukan';
</script>

<div class="py-8">
	<p class="text-gray-600 pb-4 mb-6 border-b border-gray-300">
		These preferences only apply to you.
	</p>

	{#if $view === 'profile'}
		<!-- Profile Section -->
		<div class="border-gray-300 rounded-lg">
			<h2 class="text-lg font-semibold mb-4">Global</h2>
			<p class="text-gray-300 mb-6">This applies across your FarmHub account.</p>

			<!-- Profile Image -->
			<div class="mb-6">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="block font-semibold text-gray-700 mb-2">Profile Image</label>
				<div class="flex items-center">
					<!-- svelte-ignore a11y_img_redundant_alt -->
					<img
						src={'https://via.placeholder.com/50'}
						alt="Profile Image"
						class="w-16 h-16 rounded-full border border-gray-400"
					/>
					<button class="ml-4 text-sm font-medium text-blue-600 hover:underline focus:outline-none">
						Upload
					</button>
				</div>
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

	{#if $view === 'email'}
		<!-- Email Section -->
		<div class="mt-8">
			<p>Email section</p>
		</div>
	{/if}

	{#if $view === 'calling'}
		<!-- Calling Section -->
		<div class="mt-8">
			<p>Calling section</p>
		</div>
	{/if}

	{#if $view === 'calendar'}
		<!-- Calendar Section -->
		<div class="mt-8">
			<p>Calendar section</p>
		</div>
	{/if}

	{#if $view === 'tasks'}
		<!-- Tasks Section -->
		<div class="mt-8">
			<p>Tasks section</p>
		</div>
	{/if}

	{#if $view === 'security'}
		<!-- Email Section -->
		<div class="mt-8">
			<p>Security section</p>
		</div>
	{/if}
</div>
