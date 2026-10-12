// Fills data/stock-profiles.json (sector, industry, market cap) for EVERY US listed stock, with no API key and no
// daily call limit. It makes one request to Nasdaq's public stock screener, which lists all Nasdaq, NYSE and
// NYSE American companies with their market value. Run it whenever you want fresher numbers:
//   node scripts/build-stock-profiles-free.mjs
// Existing entries keep their sector and industry (the richer provider data); only the market cap is refreshed.
import fs from "fs";

const file = new URL("../data/stock-profiles.json", import.meta.url);
const existing = JSON.parse(fs.readFileSync(file, "utf8"));
const known = new Set(JSON.parse(fs.readFileSync(new URL("../data/us-stocks.json", import.meta.url), "utf8")).map(([symbol]) => symbol));

const response = await fetch("https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=25&offset=0&download=true", {
  // Nasdaq stalls requests with an unfamiliar user agent, so this one looks like a normal browser.
  headers: { "user-agent": "Mozilla/5.0", accept: "application/json" },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Nasdaq screener answered ${response.status}`);
const rows = (await response.json())?.data?.rows;
if (!Array.isArray(rows) || rows.length < 3000) throw new Error("Nasdaq screener returned too few rows; keeping the old file");

// Nasdaq's sector names, mapped onto the ones our page templates use.
const SECTORS = {
  Technology: "Technology",
  "Health Care": "Healthcare",
  Finance: "Financial Services",
  "Consumer Discretionary": "Consumer Cyclical",
  "Consumer Staples": "Consumer Defensive",
  Industrials: "Industrials",
  Energy: "Energy",
  Utilities: "Utilities",
  "Real Estate": "Real Estate",
  Telecommunications: "Communication Services",
  "Basic Materials": "Basic Materials",
};

function sectorFor(industry, nasdaqSector) {
  const text = industry.toLowerCase();
  // Nasdaq files some health and property businesses under other sectors; the industry name is the better clue.
  if (/real estate|reit/.test(text)) return "Real Estate";
  if (/biotech|pharmac|medical|drug|diagnostic|hospital|surgical|dental/.test(text) && !/insurance/.test(text)) return "Healthcare";
  return SECTORS[nasdaqSector];
}

let added = 0;
let refreshed = 0;
for (const row of rows) {
  const symbol = String(row.symbol).trim().replace("/", ".");
  const cap = Math.round(Number(row.marketCap));
  if (!known.has(symbol) || !Number.isFinite(cap) || cap <= 0) continue;
  if (existing[symbol]) {
    existing[symbol].cap = cap;
    refreshed += 1;
    continue;
  }
  const industry = String(row.industry || "").split(":").pop().trim();
  existing[symbol] = { sector: sectorFor(String(row.industry || ""), row.sector) || undefined, industry: industry || undefined, cap };
  added += 1;
}
fs.writeFileSync(file, JSON.stringify(existing));
console.log(`profiles: ${Object.keys(existing).length} (added ${added}, refreshed ${refreshed})`);
