import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import { fetchWeather } from "./services/weatherService";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (_req: Request, res: Response) => {
  res.render("index");
});

app.get("/api/weather", async (req: Request, res: Response) => {
  const city = (req.query.city as string) || "London";

  try {
    const weather = await fetchWeather(city);
    res.json(weather);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unexpected error";
    console.error("Error fetching weather data:", message);
    res.status(500).json({ error: "Failed to retrieve weather data" });
  }
});

app.listen(PORT, () => {
  console.log(`Weather Dashboard running at http://localhost:${PORT}`);
});
