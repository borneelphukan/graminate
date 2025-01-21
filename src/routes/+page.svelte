<script lang="ts">
	import { writable } from 'svelte/store';
	import HomeNavbar from '@layout/Navbars/HomeNavbar.svelte';
	import Footer from '@layout/Footer.svelte';
	import TextField from '@ui/TextField.svelte';
	import Button from '@ui/Button.svelte';

	let isLogin = writable(true);

	const toggleForm = () => {
		isLogin.update((value) => !value);
	};
</script>

<svelte:head>
	<title>Welcome to Graminate: Manage your Agricultural Budget</title>
</svelte:head>
<HomeNavbar />
<div class="min-h-screen flex flex-col md:flex-row">
	<!-- Left Image Section -->
	<div
		class="hidden md:block md:w-3/4 h-screen bg-cover bg-center"
		style="background-image: url('/images/cover.png');"
	></div>

	<!-- Right Form Section -->
	<div
		class="w-full md:w-1/2 flex items-center justify-center min-h-screen bg-cover bg-center md:bg-none"
	>
		<div class="bg-white shadow-md rounded px-8 py-6 w-11/12 max-w-md">
			{#if $isLogin}
				<h2 class="text-2xl font-semibold mb-6 text-center">Login</h2>
				<form>
					<div class="mb-4">
						<TextField
							label="Email"
							placeholder="Enter your email"
							type="text"
							value=""
							width="large"
						/>
					</div>
					<div class="mb-6">
						<TextField
							label="Password"
							placeholder="Enter your password"
							password={true}
							type="password"
							value=""
							width="large"
						/>
					</div>
					<div class="mx-auto flex flex-row justify-center">
						<Button text="Login" width="large" style="primary" />
					</div>
				</form>
				<p class="text-center mt-4 text-sm text-gray-600">
					Don't have an account?{' '}
					<button class="text-blue-500 hover:underline focus:outline-none" on:click={toggleForm}>
						Sign Up
					</button>
				</p>
			{:else}
				<h2 class="text-2xl font-semibold mb-6 text-center">Sign Up</h2>
				<form>
					<div class="mb-4">
						<TextField
							label="First Name"
							placeholder="Enter your First Name"
							type="text"
							value=""
							width="large"
						/>
					</div>
					<div class="mb-4">
						<TextField
							label="Last Name"
							placeholder="Enter your Last Name"
							type="text"
							value=""
							width="large"
						/>
					</div>
					<div class="mb-4">
						<TextField label="Date of Birth" type="text" value="" width="large" calendar />
					</div>
					<div class="mb-4">
						<TextField
							label="Business Name (optional)"
							placeholder="Enter name of your Farm Business"
							type="text"
							value=""
							width="large"
						/>
					</div>
					<div class="mb-4">
						<TextField
							label="Password"
							placeholder="Enter your password"
							password={true}
							type="password"
							value=""
							width="large"
						/>
					</div>
					<div class="mb-6">
						<TextField
							label="Repeat Password"
							placeholder="Repeat your password"
							password={true}
							type="password"
							value=""
							width="large"
						/>
					</div>
					<Button text="Sign Up" width="large" style="primary" />
				</form>
				<p class="text-center mt-4 text-sm text-gray-600">
					Already have an account?{' '}
					<button class="text-blue-500 hover:underline focus:outline-none" on:click={toggleForm}>
						Login
					</button>
				</p>
			{/if}
		</div>
	</div>
</div>
<Footer />
