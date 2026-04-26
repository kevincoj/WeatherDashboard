import axios from "axios";
import {
  WeatherResponse,
  ForecastDay,
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherForecastItem,
  GeocodingResult,
} from "../types/weather";

const BASE_URL = "https://api.openweathermap.org";

function getApiKey(): string {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error("OPENWEATHER_API_KEY is not configured");
  }
  return key;
}

function getDayName(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function geocodeCity(city: string): Promise<GeocodingResult> {
  const apiKey = getApiKey();
  const { data } = await axios.get<GeocodingResult[]>(
    `${BASE_URL}/geo/1.0/direct`,
    { params: { q: city, limit: 1, appid: apiKey } },
  );

  if (!data.length) {
    throw new Error(`City not found: ${city}`);
  }

  return data[0];
}

async function fetchCurrentWeather(
  lat: number,
  lon: number,
): Promise<OpenWeatherCurrentResponse> {
  const apiKey = getApiKey();
  const { data } = await axios.get<OpenWeatherCurrentResponse>(
    `${BASE_URL}/data/2.5/weather`,
    { params: { lat, lon, appid: apiKey, units: "metric" } },
  );
  return data;
}

async function fetchForecast(
  lat: number,
  lon: number,
): Promise<OpenWeatherForecastResponse> {
  const apiKey = getApiKey();
  const { data } = await axios.get<OpenWeatherForecastResponse>(
    `${BASE_URL}/data/2.5/forecast`,
    { params: { lat, lon, appid: apiKey, units: "metric", cnt: 40 } },
  );
  return data;
}

function aggregateDailyForecast(
  items: OpenWeatherForecastItem[],
): ForecastDay[] {
  const dayMap = new Map<
    string,
    { high: number; low: number; condition: string }
  >();

  for (const item of items) {
    const day = getDayName(item.dt);
    const existing = dayMap.get(day);

    if (existing) {
      existing.high = Math.round(Math.max(existing.high, item.main.temp_max));
      existing.low = Math.round(Math.min(existing.low, item.main.temp_min));
    } else {
      dayMap.set(day, {
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        condition: capitalise(item.weather[0]?.description ?? "Unknown"),
      });
    }
  }

  return Array.from(dayMap.entries())
    .slice(0, 5)
    .map(([day, info]) => ({ day, ...info }));
}

export async function getWeatherForCity(
  city: string,
): Promise<WeatherResponse> {
  const { lat, lon, name } = await geocodeCity(city);

  const [current, forecast] = await Promise.all([
    fetchCurrentWeather(lat, lon),
    fetchForecast(lat, lon),
  ]);

  return {
    city: name,
    temperature: Math.round(current.main.temp),
    condition: capitalise(current.weather[0]?.description ?? "Unknown"),
    humidity: current.main.humidity,
    forecast: aggregateDailyForecast(forecast.list),
  };
}
