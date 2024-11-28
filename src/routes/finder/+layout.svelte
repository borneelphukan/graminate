<script lang="ts">
</script>

<svelte:head>
	<title>Finder</title>
</svelte:head>

<div class="flex flex-col min-h-screen">
	<div class="flex flex-1">
		<!-- Sidebar -->
		<!-- <SettingsBar /> -->

		<!-- Main Content -->
		<div class="flex-1">
			<slot />
		</div>
	</div>
</div>
