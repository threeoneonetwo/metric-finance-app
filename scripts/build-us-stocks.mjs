// Rebuilds data/us-stocks.json, the list of every stock on the Nasdaq and NYSE, from the free SEC ticker file.
// Run: node scripts/build-us-stocks.mjs   (then commit the result). Refresh every few months for new listings.
import fs from "fs";

const response = await fetch("https://www.sec.gov/files/company_tickers_exchange.json", {
  headers: { "User-Agent": "Metric Finance vanshpandita11@gmail.com" },
});
const { fields, data } = await response.json();
const EXCHANGES = { Nasdaq: "NASDAQ", NYSE: "NYSE" };
const KEEP_UPPER = new Set(["USA", "US", "AI", "ETF", "REIT", "II", "III", "IV", "ADR", "LLC", "LP", "UK", "SA", "NV", "AG", "PLC", "ASA", "SE", "CVR", "AMC", "AT&T", "IBM", "CVS", "KKR", "TJX", "UPS", "NRG", "AES", "PNC", "BP", "GE", "HP", "3M", "CME", "ICE", "S&P", "TD", "KB"]);
const LOWER = new Set(["of", "and", "the", "for", "in", "de", "co"]);

function pretty(name) {
  const letters = name.replace(/[^A-Za-z]/g, "");
  const upper = letters.length > 0 && letters === letters.toUpperCase();
  if (!upper) return name.replace(/\s+/g, " ").trim();
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      const bare = word.replace(/[^a-z&0-9]/g, "").toUpperCase();
      if (KEEP_UPPER.has(bare)) return word.toUpperCase();
      if (index > 0 && LOWER.has(word)) return word;
      if (/^(inc|corp|co|ltd|plc|llc|lp)\.?,?$/.test(word)) return word.charAt(0).toUpperCase() + word.slice(1);
      return word.replace(/(^|[(\/'-])([a-z])/g, (_, lead, ch) => lead + ch.toUpperCase());
    })
    .join(" ");
}

const out = [];
const seen = new Set();
for (const row of data) {
  const rec = Object.fromEntries(fields.map((key, index) => [key, row[index]]));
  const exchange = EXCHANGES[rec.exchange];
  if (!exchange) continue;
  let ticker = String(rec.ticker).toUpperCase();
  if (ticker.includes("-")) {
    if (!/^[A-Z]+-[A-Z]$/.test(ticker)) continue; // skip preferreds, warrants and units
    ticker = ticker.replace("-", ".");
  }
  if (!/^[A-Z0-9.]{1,10}$/.test(ticker) || seen.has(ticker)) continue;
  seen.add(ticker);
  out.push([ticker, pretty(String(rec.name)), exchange]);
}
fs.writeFileSync(new URL("../data/us-stocks.json", import.meta.url), JSON.stringify(out));
console.log(`wrote ${out.length} stocks`);
