import axios from "axios";
import {
  WeatherResponse,
  ForecastDay,
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherForecastItem,
} from "../types/weather";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

function getApiKey(): string {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error(
      "OPENWEATHER_API_KEY is not set. Add it to your .env file."
    );
  }
  return key;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Group the 3-hour forecast entries by calendar date and compute
 * high / low / most-frequent condition for each day.
 */
function aggregateDailyForecast(
  items: OpenWeatherForecastItem[]
): ForecastDay[] {
  const byDate = new Map<
    string,
    { temps: number[]; conditions: string[]; dateStr: string }
  >();

  for (const item of items) {
    const dateKey = item.dt_txt.split(" ")[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { temps: [], conditions: [], dateStr: item.dt_txt });
    }
    const bucket = byDate.get(dateKey)!;
    bucket.temps.push(item.main.temp_max, item.main.temp_min);
    bucket.conditions.push(item.weather[0].main);
  }

  const days: ForecastDay[] = [];

  for (const [, bucket] of byDate) {
    if (days.length >= 5) break;
    days.push({
      day: getDayName(bucket.dateStr),
      high: Math.round(Math.max(...bucket.temps)),
      low: Math.round(Math.min(...bucket.temps)),
      condition: capitalize(
        mostFrequent(bucket.conditions) ?? bucket.conditions[0]
      ),
    });
  }

  return days;
}

function mostFrequent(arr: string[]): string | undefined {
  const counts = new Map<string, number>();
  let maxCount = 0;
  let maxItem: string | undefined;
  for (const item of arr) {
    const c = (counts.get(item) ?? 0) + 1;
    counts.set(item, c);
    if (c > maxCount) {
      maxCount = c;
      maxItem = item;
    }
  }
  return maxItem;
}

export async function fetchWeather(city: string): Promise<WeatherResponse> {
  const apiKey = getApiKey();

  const [currentRes, forecastRes] = await Promise.all([
    axios.get<OpenWeatherCurrentResponse>(`${BASE_URL}/weather`, {
      params: { q: city, appid: apiKey, units: "metric" },
    }),
    axios.get<OpenWeatherForecastResponse>(`${BASE_URL}/forecast`, {
      params: { q: city, appid: apiKey, units: "metric" },
    }),
  ]);

  const current = currentRes.data;
  const forecast = forecastRes.data;

  return {
    city: current.name,
    temperature: Math.round(current.main.temp),
    condition: capitalize(current.weather[0].description),
    humidity: current.main.humidity,
    forecast: aggregateDailyForecast(forecast.list),
  };
}
