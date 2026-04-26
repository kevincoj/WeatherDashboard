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
    description: string;
    main: string;
  }>;
}

export interface OpenWeatherForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    description: string;
    main: string;
  }>;
}

export interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
  city: {
    name: string;
  };
}
