export async function getWeather(lat: number, lon: number): Promise<any> {
	const apiKey = import.meta.env.VITE_OPEN_WEATHER_API_KEY;

	const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,alerts&appid=${apiKey}
`;

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(` ${response.statusText}`);
	}

	return response.json();
}
