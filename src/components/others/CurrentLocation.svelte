<script lang="ts">
	import { onMount } from 'svelte';

	const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	const LATITUDE = 91.81508731307306;
	const LONGITUDE = 26.13584410412397;

	let mapContainer: HTMLDivElement;

	onMount(() => {
		if (typeof google !== 'undefined') {
			const map = new google.maps.Map(mapContainer, {
				center: { lat: LATITUDE, lng: LONGITUDE },
				zoom: 15
			});

			new google.maps.Marker({
				position: { lat: LATITUDE, lng: LONGITUDE },
				map: map,
				title: 'Our Location'
			});
		} else {
			console.error('Google Maps script not loaded');
		}
	});
</script>

<div bind:this={mapContainer} class="w-full h-[300px] md:h-[400px] rounded-lg shadow-md"></div>

<!-- Load Google Maps Script -->
<svelte:head>
	<script
		src="https://maps.googleapis.com/maps/api/js?key={GOOGLE_MAPS_API_KEY}"
		async
		defer
	></script>
</svelte:head>
