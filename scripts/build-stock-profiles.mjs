// Refreshes data/stock-profiles.json (sector, industry, market cap) for the stocks we publish guides for.
// Uses one Financial Modeling Prep call per stock, so run it when the daily call quota is fresh:
//   FMP_API_KEY=... node scripts/build-stock-profiles.mjs
// It keeps existing entries and stops safely if the daily limit is hit.
import fs from "fs";

const key = process.env.FMP_API_KEY;
if (!key) throw new Error("Set FMP_API_KEY");
const file = new URL("../data/stock-profiles.json", import.meta.url);
const existing = JSON.parse(fs.readFileSync(file, "utf8"));
const stocks = JSON.parse(fs.readFileSync(new URL("../data/us-stocks.json", import.meta.url), "utf8"));
const wanted = (process.env.SYMBOLS ?? "").split(",").filter(Boolean);
const targets = wanted.length ? wanted : stocks.slice(0, 400).map(([symbol]) => symbol);

for (const symbol of targets) {
  if (!wanted.length && existing[symbol]?.industry) continue;
  const response = await fetch(`https://financialmodelingprep.com/stable/profile?symbol=${encodeURIComponent(symbol.replace(".", "-"))}&apikey=${key}`);
  const data = await response.json();
  if (!Array.isArray(data)) {
    console.log("Stopping:", JSON.stringify(data).slice(0, 120));
    break;
  }
  const profile = data[0];
  if (!profile || profile.isEtf || profile.isFund) continue;
  existing[symbol] = { sector: profile.sector || undefined, industry: profile.industry || undefined, cap: Math.round(profile.marketCap || 0) };
  await new Promise((resolve) => setTimeout(resolve, 300));
}
fs.writeFileSync(file, JSON.stringify(existing));
console.log("profiles saved:", Object.keys(existing).length);
