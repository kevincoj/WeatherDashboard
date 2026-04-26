/** Coordinates returned by the OpenWeather Geocoding API. */
export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/** Shape of the current-weather portion from the One Call API 3.0. */
export interface OneCallCurrent {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  weather: { id: number; main: string; description: string; icon: string }[];
}

/** Shape of a single daily entry from the One Call API 3.0. */
export interface OneCallDaily {
  dt: number;
  temp: { day: number; min: number; max: number; night: number };
  weather: { id: number; main: string; description: string; icon: string }[];
}

/** Full response from the One Call API 3.0 (fields we use). */
export interface OneCallResponse {
  lat: number;
  lon: number;
  current: OneCallCurrent;
  daily: OneCallDaily[];
}

/** A single day in the 5-day forecast returned by our API. */
export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
}

/** Response shape served by GET /api/weather (must match the frontend). */
export interface WeatherApiResponse {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  forecast: ForecastDay[];
}
