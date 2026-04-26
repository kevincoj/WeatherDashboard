import axios from "axios";
import type {
  GeocodingResult,
  OneCallResponse,
  WeatherApiResponse,
} from "../types/weather";

const BASE_URL = "https://api.openweathermap.org";

function getApiKey(): string {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error(
      "Missing OPENWEATHER_API_KEY environment variable. " +
        "Get one at https://openweathermap.org/api and add it to your .env file.",
    );
  }
  return key;
}

/**
 * Convert a city name to geographic coordinates using the OpenWeather
 * Geocoding API.
 */
export async function geocodeCity(city: string): Promise<GeocodingResult> {
  const { data } = await axios.get<GeocodingResult[]>(
    `${BASE_URL}/geo/1.0/direct`,
    { params: { q: city, limit: 1, appid: getApiKey() } },
  );

  if (!data.length) {
    throw new GeocodingError(`City not found: ${city}`);
  }
  return data[0];
}

/**
 * Fetch current conditions and an 8-day daily forecast from the
 * One Call API 3.0, then trim and reshape the result to our API contract.
 */
export async function getWeather(city: string): Promise<WeatherApiResponse> {
  const location = await geocodeCity(city);

  const { data } = await axios.get<OneCallResponse>(
    `${BASE_URL}/data/3.0/onecall`,
    {
      params: {
        lat: location.lat,
        lon: location.lon,
        exclude: "minutely,hourly,alerts",
        units: "metric",
        appid: getApiKey(),
      },
    },
  );

  const current = data.current;
  const forecast = data.daily.slice(0, 5).map((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    return {
      day: dayName,
      high: Math.round(day.temp.max),
      low: Math.round(day.temp.min),
      condition: day.weather[0].description,
    };
  });

  return {
    city: location.name,
    temperature: Math.round(current.temp),
    condition: current.weather[0].description,
    humidity: current.humidity,
    forecast,
  };
}

/** Thrown when the geocoding step cannot resolve a city name. */
export class GeocodingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeocodingError";
  }
}
