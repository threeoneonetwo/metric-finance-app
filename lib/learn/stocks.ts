import profiles from "@/data/stock-profiles.json";
import { STOCK_GUIDES, shortName, type StockGuide } from "@/lib/stock-guides";
import { US_STOCKS } from "@/lib/stock-lookup";
import type { Stock } from "@/lib/stocks";

// Everything the programmatic stock pages need. No network calls: facts come from the local stock list and
// data/stock-profiles.json (sector, industry, market cap), so thousands of pages cost nothing to serve.
export type Profile = { sector?: string; industry?: string; cap?: number };
export type StockEntry = { stock: Stock; name: string; slug: string; guide: StockGuide | null; profile: Profile | null };

// Provider industry names contain dashes ("Software - Infrastructure"); we never show dashes, so they become spaces.
const clean = (value?: string) => value?.replace(/\s*[-–—]\s*/g, " ").trim();
const PROFILES = Object.fromEntries(
  Object.entries(profiles as Record<string, Profile>).map(([symbol, profile]) => [symbol, { ...profile, sector: clean(profile.sector), industry: clean(profile.industry) }]),
) as Record<string, Profile>;
const GUIDE_BY_SYMBOL = new Map(STOCK_GUIDES.map((guide) => [guide.symbol, guide]));

export const slugOf = (symbol: string) => symbol.toLowerCase().replace(/\./g, "-");

const ENTRIES: StockEntry[] = US_STOCKS.map((stock) => ({
  stock,
  name: shortName(stock.name),
  slug: slugOf(stock.symbol),
  guide: GUIDE_BY_SYMBOL.get(stock.symbol) ?? null,
  profile: PROFILES[stock.symbol] ?? null,
}));
const BY_SLUG = new Map(ENTRIES.map((entry) => [entry.slug, entry]));

export const findStock = (slug: string) => BY_SLUG.get(slug.toLowerCase()) ?? null;
// Only stocks we have real facts for are offered to search engines. The rest still work for visitors.
export const isIndexable = (entry: StockEntry) => Boolean(entry.guide || entry.profile?.industry);
export const indexableStocks = () => ENTRIES.filter(isIndexable).sort((a, b) => (b.profile?.cap ?? 0) - (a.profile?.cap ?? 0));

export function sizeLabel(cap?: number) {
  if (!cap) return null;
  if (cap >= 200e9) return "mega cap";
  if (cap >= 10e9) return "large cap";
  if (cap >= 2e9) return "mid cap";
  if (cap >= 300e6) return "small cap";
  return "micro cap";
}

export function money(cap?: number) {
  if (!cap) return null;
  if (cap >= 1e12) return `${(cap / 1e12).toFixed(2).replace(/\.?0+$/, "")} trillion dollars`;
  if (cap >= 1e9) return `${(cap / 1e9).toFixed(1).replace(/\.0$/, "")} billion dollars`;
  return `${(cap / 1e6).toFixed(0)} million dollars`;
}

export function peersOf(entry: StockEntry, count = 4): StockEntry[] {
  const industry = entry.profile?.industry;
  const sector = entry.profile?.sector;
  const pool = indexableStocks().filter((other) => other.stock.symbol !== entry.stock.symbol);
  const sameIndustry = industry ? pool.filter((other) => other.profile?.industry === industry) : [];
  const sameSector = sector ? pool.filter((other) => other.profile?.sector === sector && other.profile?.industry !== industry) : [];
  return [...sameIndustry, ...sameSector].slice(0, count);
}

type Drivers = { makes: string[]; moves: string[] };

// What typically drives companies in each sector. Used when we have no hand written guide for a stock.
const SECTOR_DRIVERS: Record<string, Drivers> = {
  Technology: {
    makes: ["Selling software, hardware or cloud services, often as a subscription.", "Charging businesses and consumers for products they use every day.", "Licensing its technology and selling related services."],
    moves: ["How fast sales are growing, especially in cloud and AI.", "New product launches and customer wins.", "Competition, regulation and how much the company spends on research."],
  },
  "Communication Services": {
    makes: ["Advertising shown to large audiences.", "Subscriptions for streaming, media or connectivity.", "Selling content, games or network access."],
    moves: ["How many people use or subscribe to the service.", "Advertiser demand, which rises and falls with the economy.", "Hit content, new rules and competition."],
  },
  "Consumer Cyclical": {
    makes: ["Selling products and services people buy when they feel confident, like cars, travel, shopping and dining.", "Online and in store sales.", "Memberships, financing and services around the main product."],
    moves: ["How confident shoppers feel and how much they spend.", "Interest rates, which affect big purchases.", "Prices, costs and competition."],
  },
  "Consumer Defensive": {
    makes: ["Selling everyday goods such as food, drinks and household items.", "Brands that people keep buying in good times and bad.", "Stores and distribution."],
    moves: ["Costs for ingredients, packaging and shipping.", "Whether shoppers trade down to cheaper brands.", "Steady dividends and market mood, since these stocks are seen as safer."],
  },
  Healthcare: {
    makes: ["Selling medicines, medical devices or healthcare services.", "Insurance premiums or hospital and clinic fees.", "Research and licensing deals."],
    moves: ["Results from clinical trials and approvals from regulators.", "Drug prices, insurance rules and government policy.", "Patents running out and new competing treatments."],
  },
  "Financial Services": {
    makes: ["Interest earned on loans minus interest paid on deposits.", "Fees for payments, advice, trading and insurance.", "Investment returns on the money they manage."],
    moves: ["Interest rates and the health of the economy.", "How many borrowers fail to repay loans.", "Rules from regulators and market activity."],
  },
  Industrials: {
    makes: ["Building and selling machines, aircraft, equipment or infrastructure.", "Moving goods and people.", "Long term service and maintenance contracts."],
    moves: ["Orders and backlog, which show future sales.", "Business spending and the health of the economy.", "Costs of materials and labor."],
  },
  Energy: {
    makes: ["Producing, refining and moving oil and natural gas.", "Selling fuel and related products.", "Services for energy producers."],
    moves: ["The price of oil and natural gas.", "How much the company produces and what it costs.", "Energy policy and global demand."],
  },
  Utilities: {
    makes: ["Delivering electricity, gas or water to homes and businesses.", "Rates approved by regulators.", "Growing clean energy projects."],
    moves: ["Interest rates, since utilities carry a lot of debt.", "Decisions by regulators on prices.", "Weather and demand for power."],
  },
  "Real Estate": {
    makes: ["Collecting rent from buildings, towers, warehouses or homes.", "Owning and managing property.", "Fees for services tied to real estate."],
    moves: ["Interest rates, which affect borrowing costs and property values.", "Occupancy and how much rent can be charged.", "Demand for the type of property they own."],
  },
  "Basic Materials": {
    makes: ["Mining and selling metals and minerals.", "Making chemicals and building materials.", "Supplying raw materials to other industries."],
    moves: ["The prices of commodities like copper, gold and lithium.", "Global demand, especially from large economies.", "Production costs and supply disruptions."],
  },
};
const DEFAULT_DRIVERS: Drivers = {
  makes: ["Selling products or services to its customers.", "Growing sales while controlling costs.", "Returning extra cash to shareholders in some cases."],
  moves: ["Quarterly results compared with what analysts expected.", "News about its products, customers and competition.", "Interest rates and the overall mood of the market."],
};

export function driversFor(entry: StockEntry): Drivers {
  if (entry.guide) return { makes: entry.guide.makesMoney, moves: entry.guide.movesStock };
  return SECTOR_DRIVERS[entry.profile?.sector ?? ""] ?? DEFAULT_DRIVERS;
}

export function summaryFor(entry: StockEntry): string {
  if (entry.guide) return entry.guide.simple;
  const { name, stock, profile } = entry;
  const size = sizeLabel(profile?.cap);
  const cap = money(profile?.cap);
  const where = `${name} trades on the ${stock.exchange === "NYSE" ? "New York Stock Exchange" : "Nasdaq"} under the ticker ${stock.symbol}.`;
  if (profile?.industry) {
    return `${where} It is a ${size ? `${size} ` : ""}company in the ${profile.industry.toLowerCase()} industry, part of the ${(profile.sector ?? "").toLowerCase()} sector${cap ? `, with a market value of about ${cap}` : ""}.`;
  }
  return `${where} It is a US listed company that investors can follow by name or ticker.`;
}

export function termsFor(entry: StockEntry): string[] {
  const terms = ["market-cap", "pe-ratio", "eps", "earnings-report"];
  if (entry.profile?.sector === "Financial Services" || entry.profile?.sector === "Utilities" || entry.profile?.sector === "Real Estate") terms.push("dividend-yield");
  else terms.push("volatility");
  return terms;
}

export function comparePairs(): [StockEntry, StockEntry][] {
  const pairs: [StockEntry, StockEntry][] = [];
  const pool = indexableStocks().slice(0, 120);
  const seen = new Set<string>();
  for (const entry of pool) {
    for (const peer of peersOf(entry, 3)) {
      if (!pool.some((item) => item.stock.symbol === peer.stock.symbol)) continue;
      const [a, b] = [entry, peer].sort((x, y) => x.slug.localeCompare(y.slug));
      const key = `${a.slug}-vs-${b.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push([a, b]);
    }
  }
  return pairs;
}
