export type Stock = {
  symbol: string;
  name: string;
  exchange: "NASDAQ" | "NYSE";
};

export const MAX_PICKS = 5;

export const STOCKS: Stock[] = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms, Inc.", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ" },
  { symbol: "AVGO", name: "Broadcom Inc.", exchange: "NASDAQ" },
  { symbol: "NFLX", name: "Netflix, Inc.", exchange: "NASDAQ" },
  { symbol: "COST", name: "Costco Wholesale Corporation", exchange: "NASDAQ" },
  { symbol: "AMD", name: "Advanced Micro Devices, Inc.", exchange: "NASDAQ" },
  { symbol: "ADBE", name: "Adobe Inc.", exchange: "NASDAQ" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE" },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE" },
  { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE" },
  { symbol: "XOM", name: "Exxon Mobil Corporation", exchange: "NYSE" },
  { symbol: "MA", name: "Mastercard Incorporated", exchange: "NYSE" },
  { symbol: "KO", name: "The Coca-Cola Company", exchange: "NYSE" },
  { symbol: "DIS", name: "The Walt Disney Company", exchange: "NYSE" },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", exchange: "NYSE" },
  { symbol: "PLTR", name: "Palantir Technologies Inc.", exchange: "NASDAQ" },
  { symbol: "COIN", name: "Coinbase Global, Inc.", exchange: "NASDAQ" },
];

/** Resolves stored ticker symbols back into full stock records, dropping any we no longer list. */
export function stocksFromSymbols(symbols: string[]): Stock[] {
  return symbols
    .map((symbol) => STOCKS.find((stock) => stock.symbol === symbol.toUpperCase()))
    .filter((stock): stock is Stock => Boolean(stock))
    .slice(0, MAX_PICKS);
}
