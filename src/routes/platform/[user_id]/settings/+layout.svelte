<script lang="ts">
	import SettingsBar from '@layout/SettingsBar.svelte';
</script>

<svelte:head>
	<title>Graminate Settings</title>
</svelte:head>

<div class="container mx-auto p-3">
	<div class="flex flex-col min-h-screen">
		<div class="flex flex-1">
			<!-- Sidebar -->
			<SettingsBar />

			<!-- Main Content -->
			<div class="flex-1 px-12">
				<slot />
			</div>
		</div>
	</div>
</div>
