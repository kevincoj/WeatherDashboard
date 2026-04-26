export interface CurrentWeather {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
}

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

export interface OpenWeatherCurrentResponse {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
}

export interface OpenWeatherForecastItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
}

export interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
}

export interface GeocodingResult {
  lat: number;
  lon: number;
  name: string;
}
