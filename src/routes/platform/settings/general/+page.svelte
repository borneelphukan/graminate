<script lang="ts">
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import { locale, t } from '../../../../lib/i18n'; // Import locale and translation function
	import TextField from '../../../../components/ui/TextField.svelte';
	import DropdownSmall from '../../../../components/ui/Dropdown/DropdownSmall.svelte';
	import Swal from 'sweetalert2';
	import Button from '../../../../components/ui/Button.svelte';

	const view = derived(page, ($page) => $page.url.searchParams.get('view') || 'profile');
	let languages = ['English', 'हिन्दी', 'অসমীয়া'];
	let selectedLanguage = 'English';
	let firstName = 'Borneel Bikash';
	let lastName = 'Phukan';
	let defaultLocation = 'Duliajan';
	let selectedFile: File | null = null;
	let profileImageUrl = 'https://eu.ui-avatars.com/api/?name=Borneel+Phukan&size=250';

	const temperatureScale = ['Celsius', 'Fahrenheit'];
	$: locale.set('english');

	// Validate uploaded file
	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			const fileReader = new FileReader();

			// Check file type
			if (!file.type.startsWith('image/')) {
				Swal.fire({
					title: $t('invalid_file'),
					text: $t('valid_image_file_message'),
					icon: 'error',
					confirmButtonText: $t('ok')
				});
				return;
			}

			fileReader.onload = function (e) {
				const img = new Image();
				img.src = e.target?.result as string;
				img.onload = () => {
					if (img.width > 4260 || img.height > 4260) {
						Swal.fire({
							title: $t('image_too_large'),
							text: $t('image_dimension_message'),
							icon: 'warning',
							confirmButtonText: $t('ok')
						});
					} else {
						selectedFile = file;
						profileImageUrl = e.target?.result as string;
					}
				};
			};

			fileReader.readAsDataURL(file);
		}
	}

	// Trigger file input click
	function triggerFileUpload() {
		const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
		if (fileInput) {
			fileInput.click();
		}
	}

	// Save Profile changes
	function SaveProfile() {
		switch (selectedLanguage) {
			case 'हिन्दी':
				locale.set('hindi');
				break;
			case 'অসমীয়া':
				locale.set('assamese');
				break;
			default:
				locale.set('english');
		}

		Swal.fire({
			title: $t('changes_saved'),
			text: `${$t('language_updated_to')} ${selectedLanguage}`,
			icon: 'success',
			confirmButtonText: $t('ok')
		});
	}
</script>

<div class="py-6">
	{#if $locale}
		<!-- Profile Section -->
		{#if $view === 'profile'}
			<div class="border-gray-300 rounded-lg">
				<h2 class="text-lg font-semibold mb-4 dark:text-light">{$t('global_settings')}</h2>
				<p class="text-gray-300 mb-6">{$t('applies_across_account')}</p>

				<!-- Profile Image -->
				<div class="mb-6">
					<label for="fileInput" class="block font-semibold dark:text-light mb-2"
						>{$t('profile_image')}</label
					>
					<div class="flex items-center">
						<!-- svelte-ignore a11y_img_redundant_alt -->
						<img
							src={profileImageUrl}
							alt="User profile picture"
							class="w-16 h-16 rounded-full border border-gray-400"
						/>
						<button
							class="ml-4 text-sm font-medium text-blue-600 hover:underline focus:outline-none"
							onclick={triggerFileUpload}
						>
							{$t('upload')}
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
						<p class="mt-2 text-sm text-green-600">{selectedFile.name}</p>
					{/if}
				</div>

				<!-- First Name -->
				<div class="mb-6">
					<TextField bind:value={firstName} label={$t('first_name')} placeholder={$t('first_name_placeholder')} />
				</div>

				<!-- Last Name -->
				<div class="mb-6">
					<TextField
						bind:value={lastName}
						label={$t('last_name')}
						placeholder={$t('last_name_placeholder')}
					/>
				</div>

				<!-- Language -->
				<div class="mb-6 w-1/2">
					<DropdownSmall
						bind:selected={selectedLanguage}
						items={languages}
						label={$t('language')}
						on:select={(e) => console.log('Selected language:', e.detail.item)}
					/>
				</div>
			</div>
			<div class="flex flex-1 gap-2 mb-6">
				<Button text={$t('save_changes')} on:click={SaveProfile} />
			</div>
		{/if}

		<!-- Weather Section -->
		{#if $view === 'weather'}
			<div class="border-gray-300 rounded-lg">
				<h2 class="text-lg font-semibold mb-4 dark:text-light">{$t('weather_settings')}</h2>
				<p class="text-gray-300 mb-6">{$t('applies_across_account')}</p>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<TextField
					bind:value={defaultLocation}
					label={$t('farm_location')}
					placeholder={$t('farm_location_placeholder')}
				/>
				<DropdownSmall items={temperatureScale} label={$t('temperature_scale')} />
			</div>
		{/if}

		{#if $view === 'milestones'}
			<!-- Milestones Section -->
			<div class="border-gray-300 rounded-lg">
				<h2 class="text-lg font-semibold mb-4 dark:text-light">Milestones Settings</h2>
				<p class="text-gray-300 mb-6">This changes your farming steps and sets your milestones.</p>
			</div>
		{/if}

		{#if $view === 'calendar'}
			<!-- Calendar Section -->
			<div class="border-gray-300 rounded-lg">
				<h2 class="text-lg font-semibold mb-4 dark:text-light">Calendar Settings</h2>
				<p class="text-gray-300 mb-6">This changes your calendar settings.</p>
			</div>
		{/if}

		{#if $view === 'tasks'}
			<!-- Tasks Section -->
			<div class="border-gray-300 rounded-lg">
				<h2 class="text-lg font-semibold mb-4 dark:text-light">Tasks Settings</h2>
				<p class="text-gray-300 mb-6">This changes your task settings.</p>
			</div>
		{/if}

		{#if $view === 'security'}
			<!-- Email Section -->
			<div class="border-gray-300 rounded-lg">
				<h2 class="text-lg font-semibold mb-4 dark:text-light">Security Settings</h2>
				<p class="text-gray-300 mb-6">This changes your security settings.</p>
			</div>
		{/if}
	{/if}
</div>
