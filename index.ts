import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import axios from "axios";
import { getWeatherForCity } from "./weatherService";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (_req: Request, res: Response) => {
  res.render("index");
});

app.get("/api/weather", async (req: Request, res: Response) => {
  const city = (req.query.city as string) || "";

  if (!city) {
    res.status(400).json({ error: "city query parameter is required" });
    return;
  }

  try {
    const data = await getWeatherForCity(city);
    res.json(data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        `OpenWeather API error: ${error.response.status} – ${error.response.data?.message}`
      );
      res
        .status(error.response.status)
        .json({ error: error.response.data?.message ?? "API error" });
    } else if (error instanceof Error) {
      console.error("Weather fetch error:", error.message);
      res.status(502).json({ error: error.message });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Weather Dashboard running at http://localhost:${PORT}`);
});
