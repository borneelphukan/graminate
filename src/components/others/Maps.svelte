<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGoogleMaps } from '@lib/utils/loadGoogleMaps';

	export let apiKey: string;
	export let initialCenter = { lat: 26.244156, lng: 92.537842 }; // Default centre to Assam
	export let initialZoom = 8;

	export let onStateChange: (state: { center: google.maps.LatLngLiteral; zoom: number }) => void;

	let mapContainer: HTMLDivElement | null = null;
	let map: google.maps.Map | null = null;

	onMount(async () => {
		await loadGoogleMaps(apiKey);

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					initializeMap({ lat: latitude, lng: longitude }, 12);
				},
				(error) => {
					console.error('Error getting location', error);
					initializeMap(initialCenter, initialZoom);
				}
			);
		} else {
			console.warn('Geolocation is not supported by this browser.');
			initializeMap(initialCenter, initialZoom);
		}
	});

	function initializeMap(center: google.maps.LatLngLiteral, zoom: number) {
		if (mapContainer) {
			map = new google.maps.Map(mapContainer, {
				center,
				zoom,
				mapTypeControl: false,
				fullscreenControl: false,
				streetViewControl: false
			});

			map.addListener('idle', () => {
				if (map) {
					const center = map.getCenter();
					const zoom = map.getZoom();
					if (center && zoom !== undefined && onStateChange) {
						onStateChange({
							center: center.toJSON(),
							zoom: zoom
						});
					}
				}
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
