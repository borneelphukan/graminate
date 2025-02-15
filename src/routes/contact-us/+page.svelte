<script lang="ts">
	import HomeNavbar from '@layout/Navbars/HomeNavbar.svelte';
	import Footer from '@layout/Footer.svelte';
	import TextArea from '@ui/TextArea.svelte';
	import TextField from '@ui/TextField.svelte';
	import { writable } from 'svelte/store';
	import Button from '@ui/Button.svelte';
	import emailjs from 'emailjs-com';
	import Toast from '@ui/Toast.svelte';
	import { triggerToast } from '../../stores/toast';
	import GoogleMap from '@others/CurrentLocation.svelte';

	let contactInfo = writable<Record<string, string>>({
		firstName: '',
		lastName: '',
		email: '',
		message: ''
	});

	let errors = writable<Record<string, string>>({
		firstName: '',
		lastName: '',
		email: '',
		message: ''
	});

	const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
	const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
	const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

	function validateForm(values: Record<string, string>): boolean {
		let valid = true;
		let newErrors: Record<string, string> = {};

		if (!values.firstName.trim()) {
			newErrors.firstName = 'First name is required';
			valid = false;
		}

		if (!values.lastName.trim()) {
			newErrors.lastName = 'Last name is required';
			valid = false;
		}

		if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
			newErrors.email = 'Valid email is required';
			valid = false;
		}

		if (!values.message.trim()) {
			newErrors.message = 'Message cannot be empty';
			valid = false;
		}

		errors.set(newErrors);
		return valid;
	}

	async function handleSubmit() {
		contactInfo.subscribe(async (values) => {
			if (!validateForm(values)) return;

			try {
				await emailjs.send(SERVICE_ID, TEMPLATE_ID, values, PUBLIC_KEY);
				triggerToast('Message sent successfully!');
				contactInfo.set({ firstName: '', lastName: '', email: '', message: '' });
			} catch (error) {
				console.error('Error sending email:', error);
				triggerToast('Failed to send message. Please try again.');
			}
		})();
	}
</script>

<svelte:head>
	<title>Contact Us</title>
</svelte:head>

<HomeNavbar signIn />

<div class="bg-gray-500">
	<div
		class="mx-auto max-w-7xl px-6 py-24 sm:py-24 lg:flex lg:items-center lg:justify-between lg:px-8"
	>
		<h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
			Would you like to cooperate with us?<br />We look forward to seeing you!
		</h2>
		<div class="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
			<a
				href="/"
				class="rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
			>
				Set an Appointment
			</a>
		</div>
	</div>
</div>

<div class="p-6 flex flex-col h-full">
	<h2 class="text-3xl font-bold text-center lg:text-left">Get in Touch With Us</h2>
	<div class="flex flex-col lg:flex-row gap-8">
		<!-- Contact Form -->
		<div class="w-full lg:w-1/2">
			<form on:submit|preventDefault={handleSubmit} class="w-full px-6 py-8">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<TextField
						label="First Name"
						placeholder="Your First Name"
						type="text"
						bind:value={$contactInfo.firstName}
					/>
					<TextField
						label="Last Name"
						placeholder="Your Last Name"
						type="text"
						bind:value={$contactInfo.lastName}
					/>
				</div>

				<div class="mb-6">
					<TextField
						label="Email Address"
						placeholder="Enter your email"
						type="email"
						bind:value={$contactInfo.email}
					/>
					{#if $errors.email}<p class="text-red-500 text-sm">{$errors.email}</p>{/if}
				</div>

				<div class="mb-6">
					<TextArea
						label="Message"
						placeholder="Your message here"
						type="text"
						bind:value={$contactInfo.message}
					/>
					{#if $errors.message}<p class="text-red-500 text-sm">{$errors.message}</p>{/if}
				</div>

				<div class="flex justify-center lg:justify-start">
					<Button text="Send" style="primary" width="large" on:click={handleSubmit} />
				</div>
			</form>
		</div>

		<!-- Google Map -->
		<div class="w-full lg:w-1/2">
			<GoogleMap />
		</div>
	</div>
</div>

<Toast />
<Footer />
