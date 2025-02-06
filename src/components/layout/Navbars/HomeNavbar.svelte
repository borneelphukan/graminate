<script lang="ts">
	export let imageSrc: string = '/images/logo.png';
	export let signIn: boolean = false;
</script>

<header class="bg-gray-800 py-2">
	<div class="mx-auto max-w-7xl px-2 sm:px-4 lg:divide-y lg:divide-gray-700 lg:px-8">
		<div class="relative flex h-12 py-1 justify-between items-center">
			<!-- Logo Section -->
			<div class="relative z-10 flex px-2 lg:px-0">
				<div class="flex flex-shrink-0 items-center">
					<a href="/" class="flex flex-row items-center gap-4">
						<img src={imageSrc} alt="Graminate Logo" class="h-10 w-auto" />
						<span class=" text-bold text-3xl text-light">Graminate</span>
						<sup class=" text-bold text-lg text-light">ERP</sup>
					</a>
				</div>
			</div>

			{#if signIn}
				<div class="flex items-center">
					<a href="/" class="text-light hover:underline">Sign In</a>
				</div>
			{/if}
		</div>
	</div>
</header>
