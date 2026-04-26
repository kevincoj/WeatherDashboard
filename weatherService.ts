import axios from "axios";
import type {
  GeocodingResult,
  OpenWeatherCurrent,
  OpenWeatherForecastResponse,
  WeatherResponse,
  ForecastDay,
} from "./types";

const BASE_URL = "https://api.openweathermap.org";

function getApiKey(): string {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error(
      "OPENWEATHER_API_KEY is not set. Add it to your .env file."
    );
  }
  return key;
}

/** Resolve a city name to geographic coordinates via OpenWeather Geocoding API. */
async function geocodeCity(
  city: string
): Promise<{ lat: number; lon: number; name: string }> {
  const apiKey = getApiKey();
  const { data } = await axios.get<GeocodingResult[]>(
    `${BASE_URL}/geo/1.0/direct`,
    { params: { q: city, limit: 1, appid: apiKey } }
  );

  if (!data.length) {
    throw new Error(`City not found: ${city}`);
  }

  return { lat: data[0].lat, lon: data[0].lon, name: data[0].name };
}

/** Fetch current weather conditions for given coordinates. */
async function fetchCurrentWeather(
  lat: number,
  lon: number,
  apiKey: string
): Promise<OpenWeatherCurrent> {
  const { data } = await axios.get<OpenWeatherCurrent>(
    `${BASE_URL}/data/2.5/weather`,
    { params: { lat, lon, appid: apiKey, units: "metric" } }
  );
  return data;
}

/** Fetch 5-day / 3-hour forecast for given coordinates. */
async function fetchForecast(
  lat: number,
  lon: number,
  apiKey: string
): Promise<OpenWeatherForecastResponse> {
  const { data } = await axios.get<OpenWeatherForecastResponse>(
    `${BASE_URL}/data/2.5/forecast`,
    { params: { lat, lon, appid: apiKey, units: "metric", cnt: 40 } }
  );
  return data;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Aggregate 3-hour forecast entries into daily summaries.
 * Returns up to 5 days with the high, low, and most frequent condition per day.
 */
function aggregateDailyForecasts(
  list: OpenWeatherForecastResponse["list"]
): ForecastDay[] {
  const buckets = new Map<
    string,
    { highs: number[]; lows: number[]; conditions: string[]; date: Date }
  >();

  for (const entry of list) {
    const dateKey = entry.dt_txt.split(" ")[0]; // "YYYY-MM-DD"
    if (!buckets.has(dateKey)) {
      buckets.set(dateKey, {
        highs: [],
        lows: [],
        conditions: [],
        date: new Date(entry.dt * 1000),
      });
    }
    const bucket = buckets.get(dateKey)!;
    bucket.highs.push(entry.main.temp_max);
    bucket.lows.push(entry.main.temp_min);
    bucket.conditions.push(entry.weather[0]?.main ?? "Unknown");
  }

  const days: ForecastDay[] = [];
  for (const [, bucket] of buckets) {
    if (days.length >= 5) break;
    days.push({
      day: DAY_NAMES[bucket.date.getUTCDay()],
      high: Math.round(Math.max(...bucket.highs)),
      low: Math.round(Math.min(...bucket.lows)),
      condition: mostFrequent(bucket.conditions),
    });
  }

  return days;
}

function mostFrequent(arr: string[]): string {
  const freq = new Map<string, number>();
  for (const v of arr) {
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }
  let best = arr[0];
  let bestCount = 0;
  for (const [val, count] of freq) {
    if (count > bestCount) {
      best = val;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Main entry point: get weather data for a city name.
 * Returns data in the shape the frontend expects.
 */
export async function getWeatherForCity(
  city: string
): Promise<WeatherResponse> {
  const apiKey = getApiKey();
  const geo = await geocodeCity(city);

  const [current, forecast] = await Promise.all([
    fetchCurrentWeather(geo.lat, geo.lon, apiKey),
    fetchForecast(geo.lat, geo.lon, apiKey),
  ]);

  return {
    city: geo.name,
    temperature: Math.round(current.main.temp),
    condition: current.weather[0]?.main ?? "Unknown",
    humidity: current.main.humidity,
    forecast: aggregateDailyForecasts(forecast.list),
  };
}
