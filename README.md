# Weather Dashboard

A simple Express + TypeScript weather dashboard that displays current conditions and a 5-day forecast for any city.

The server is fully scaffolded with an EJS frontend and a `/api/weather` endpoint, but **no weather data provider has been chosen yet** — the API returns hardcoded mock data for every query.

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Start the dev server with ts-node  |
| `npm run build` | Compile TypeScript to `dist/`      |
| `npm start`     | Run the compiled JavaScript build  |

## Project Structure

```
index.ts          # Express server & API routes
views/index.ejs   # Frontend template
package.json
tsconfig.json
```

## TODO

- [ ] Pick and integrate a real weather API
- [ ] Replace mock data in `/api/weather` with live data
