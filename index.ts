import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { getWeatherForCity } from "./services/weatherService";

dotenv.config();

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
    res.status(400).json({ error: "Missing city query parameter" });
    return;
  }

  try {
    const weather = await getWeatherForCity(city);
    res.json(weather);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching weather data:", message);

    if (message.includes("not found")) {
      res.status(404).json({ error: message });
      return;
    }
    if (message.includes("not configured")) {
      res.status(500).json({ error: "OpenWeather API key not configured" });
      return;
    }
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.listen(PORT, () => {
  console.log(`Weather Dashboard running at http://localhost:${PORT}`);
});
