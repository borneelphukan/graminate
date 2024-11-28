<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGoogleMaps } from '$lib/utils/loadGoogleMaps';

	export let apiKey: string;

	let mapContainer: HTMLDivElement | null = null;

	onMount(async () => {
		await loadGoogleMaps(apiKey);

		if (navigator.geolocation) {
			// Get the user's current location
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;

					if (mapContainer) {
						const map = new google.maps.Map(mapContainer, {
							center: { lat: latitude, lng: longitude },
							zoom: 12,
							mapTypeControl: false,
							fullscreenControl: false,
							streetViewControl: false
						});
					}
				},
				(error) => {
					console.error('Error getting location', error);
					initializeDefaultMap();
				}
			);
		} else {
			console.warn('Geolocation is not supported by this browser.');
			initializeDefaultMap();
		}
	});

	function initializeDefaultMap() {
		if (mapContainer) {
			const map = new google.maps.Map(mapContainer, {
				center: { lat: 51.1657, lng: 10.4515 }, // Default location (Germany)
				zoom: 6,
				mapTypeControl: false,
				fullscreenControl: false,
				streetViewControl: false
			});
		}
	}
</script>

<div id="map" bind:this={mapContainer}></div>

<style>
	#map {
		width: 100%;
		height: 100vh;
	}
</style>
