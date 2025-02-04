<script lang="ts">
	import { page } from '$app/stores';
	import Swal from 'sweetalert2';
	import Footer from '@layout/Footer.svelte';
	import HomeNavbar from '@layout/Navbars/HomeNavbar.svelte';
	import Button from '@ui/Button.svelte';
	import TextField from '@ui/TextField.svelte';
	import Upload from '@ui/Upload.svelte';

	let position = '';
	let type = '';
	let mode = '';

	$: position = $page.params.position.replace(/-/g, ' ');
	$: type = $page.url.searchParams.get('type')?.replace(/-/g, ' ') ?? '';
	$: mode = $page.url.searchParams.get('mode')?.replace(/-/g, ' ') ?? '';

	let firstName = '';
	let lastName = '';
	let email = '';
	let phone = '';
	let portfolio = '';
	let cvFile: File | null = null;

	const handleFileUpload = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			cvFile = target.files[0];
		}
	};

	const validateForm = () => {
		if (
			!firstName.trim() ||
			!lastName.trim() ||
			!email.trim() ||
			!phone.trim() ||
			!portfolio.trim() ||
			!cvFile
		) {
			Swal.fire({
				icon: 'error',
				title: 'Missing Fields',
				text: 'Please fill in all required fields before submitting.'
			});
			return false;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			Swal.fire({
				icon: 'error',
				title: 'Invalid Email',
				text: 'Please enter a valid email address.'
			});
			return false;
		}

		// Phone validation
		const phoneRegex = /^[0-9]{10,15}$/;
		if (!phoneRegex.test(phone)) {
			Swal.fire({
				icon: 'error',
				title: 'Invalid Phone Number',
				text: 'Please enter a valid phone number (10-15 digits).'
			});
			return false;
		}

		// Portfolio URL validation
		try {
			new URL(portfolio);
		} catch (_) {
			Swal.fire({
				icon: 'error',
				title: 'Invalid Portfolio URL',
				text: 'Please enter a valid portfolio URL.'
			});
			return false;
		}

		return true;
	};

	const submitApplication = () => {
		if (!validateForm()) return;

		Swal.fire({
			icon: 'success',
			title: 'Application Submitted',
			text: `Your application for ${position} (${type}, ${mode}) has been submitted successfully!`
		});
	};

	const cancelApplication = () => {
		history.back();
	};
</script>

<HomeNavbar />

<div class="max-w-3xl my-24 sm:my-24 mx-auto p-6">
	<h2 class="text-2xl font-semibold text-gray-900 uppercase">{position}</h2>
	<p class="text-gray-200 mb-6 text-lg"><span>{type}</span> ⋅ <span>{mode}</span></p>

	<form on:submit|preventDefault={submitApplication} class="space-y-4">
		<div class="flex flex-row gap-4">
			<TextField label="First Name *" placeholder="First Name" type="text" bind:value={firstName} />
			<TextField label="Last Name *" placeholder="Last Name" type="text" bind:value={lastName} />
		</div>

		<TextField
			label="Email *"
			placeholder="e.g. john.doe@gmail.com"
			type="email"
			bind:value={email}
		/>

		<TextField
			label="Phone Number *"
			placeholder="Your Active Phone Number"
			type="tel"
			bind:value={phone}
		/>

		<TextField
			label="Portfolio *"
			placeholder="LinkedIn / Xing / Website"
			type="url"
			bind:value={portfolio}
		/>

		<Upload label="CV *" on:change={handleFileUpload} />

		<div class="flex justify-between">
			<Button text="Submit" style="primary" width="medium" type="submit" />
			<Button
				text="Cancel"
				style="secondary"
				width="medium"
				type="button"
				on:click={cancelApplication}
			/>
		</div>
	</form>
</div>

<Footer />
