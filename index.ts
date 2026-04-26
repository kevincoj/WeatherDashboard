import express, { Request, Response } from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (_req: Request, res: Response) => {
  res.render("index");
});

// TODO: Replace this stub with a real weather API integration.
// Expected response shape:
// {
//   city: string,
//   temperature: number,
//   condition: string,
//   humidity: number,
//   forecast: [{ day: string, high: number, low: number, condition: string }]
// }
app.get("/api/weather", (req: Request, res: Response) => {
  const city = req.query.city as string;

  if (!city) {
    res.status(400).json({ error: "Missing required query parameter: city" });
    return;
  }

  // TODO: Fetch real weather data for `city` from an external provider.
  // No weather API has been configured yet.
  res.status(501).json({
    error: "No weather provider configured. Integrate a weather API to enable this endpoint.",
  });
});

app.listen(PORT, () => {
  console.log(`Weather Dashboard running at http://localhost:${PORT}`);
});
