import express, { Request, Response } from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (_req: Request, res: Response) => {
  res.render("index");
});

// TODO: Replace this mock endpoint with a real weather API.
// The response shape should stay the same so the frontend keeps working.
app.get("/api/weather", (req: Request, res: Response) => {
  const city = (req.query.city as string) || "Unknown";

  // TODO: Fetch real weather data for `city` from an external provider.
  const mockData = {
    city,
    temperature: 22,
    condition: "Partly Cloudy",
    humidity: 55,
    forecast: [
      { day: "Mon", high: 24, low: 16, condition: "Sunny" },
      { day: "Tue", high: 21, low: 14, condition: "Cloudy" },
      { day: "Wed", high: 19, low: 13, condition: "Rain" },
      { day: "Thu", high: 23, low: 15, condition: "Sunny" },
      { day: "Fri", high: 25, low: 17, condition: "Partly Cloudy" },
    ],
  };

  res.json(mockData);
});

app.listen(PORT, () => {
  console.log(`Weather Dashboard running at http://localhost:${PORT}`);
});
