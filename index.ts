import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";
import { getWeather, GeocodingError } from "./services/openweather";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (_req: Request, res: Response) => {
  res.render("index");
});

app.get("/api/weather", async (req: Request, res: Response) => {
  const city = (req.query.city as string) || "";

  if (!city) {
    res.status(400).json({ error: "Missing required query parameter: city" });
    return;
  }

  try {
    const weather = await getWeather(city);
    res.json(weather);
  } catch (error: unknown) {
    if (error instanceof GeocodingError) {
      res.status(404).json({ error: error.message });
      return;
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message =
        error.response?.data?.message || "Failed to fetch weather data";
      console.error("OpenWeather API error:", error.response?.data || error.message);
      res.status(status).json({ error: message });
      return;
    }

    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Weather Dashboard running at http://localhost:${PORT}`);
});
