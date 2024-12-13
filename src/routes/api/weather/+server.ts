import { json } from '@sveltejs/kit';
import { getWeather } from '../../../lib/utils/loadWeather';

export async function GET({ url }: { url: URL }) {
	const lat = url.searchParams.get('lat');
	const lon = url.searchParams.get('lon');

	if (!lat || !lon) {
		return json({ error: 'Latitude and Longitude are required' }, { status: 400 });
	}

	try {
		const latitude = parseFloat(lat);
		const longitude = parseFloat(lon);

		if (isNaN(latitude) || isNaN(longitude)) {
			throw new Error('Invalid latitude or longitude');
		}

		const weatherData = await getWeather(latitude, longitude);
		return json(weatherData);
	} catch (error) {
		console.error('Error fetching weather data:', error);
		return json({ error: 'Failed to fetch weather data' }, { status: 500 });
	}
}
