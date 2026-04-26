// OpenWeather API response types

export interface OpenWeatherCurrent {
  weather: { id: number; main: string; description: string; icon: string }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  name: string;
}

export interface OpenWeatherForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: { id: number; main: string; description: string; icon: string }[];
}

export interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
  city: { name: string };
}

export interface GeocodingResult {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

// App-level response types (matches existing frontend contract)

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
}

export interface WeatherResponse {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  forecast: ForecastDay[];
}
