import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const productEvents = pgTable("product_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventName: text("event_name").notNull(),
  ticker: text("ticker"),
  ipHash: text("ip_hash"),
  visitorCountry: text("visitor_country"),
  visitorRegion: text("visitor_region"),
  visitorCity: text("visitor_city"),
  visitorTimezone: text("visitor_timezone"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});

export const config = pgTable("config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

// The facts a brief was written from (migration 0008). Stored so follow up questions use the exact same numbers.
export type StoredTickerFacts = {
  ticker: string;
  companyName: string;
  price: number | null;
  changePercent: number | null;
  sector: string | null;
  industry: string | null;
  headlines: { title: string; source: string | null }[];
  nextEarnings: { date: string; epsEstimated: number | null; revenueEstimated: number | null } | null;
};
export type StoredBriefFacts = { asOf: string; marketChangePercent: number | null; tickers: StoredTickerFacts[] };

export const briefings = pgTable("briefings", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriberId: uuid("subscriber_id").notNull(),
  tickers: jsonb("tickers").$type<string[]>().notNull().default([]),
  html: text("html").notNull(),
  text: text("text").notNull(),
  facts: jsonb("facts").$type<StoredBriefFacts>(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  tickers: jsonb("tickers").$type<string[]>().notNull().default([]),
  active: boolean("active").notNull().default(false),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  verificationToken: text("verification_token").unique(),
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

export type LearnStockContent = {
  simple: string;
  makesMoney: string[];
  movesStock: string[];
  goodToKnow: string[];
  faqs: { q: string; a: string }[];
};

export type LearnStockFacts = {
  ceo: string | null;
  employees: number | null;
  headquarters: string | null;
  listedSince: string | null;
  dividendPerShare: number | null;
  beta: number | null;
};

export const learnStockPages = pgTable("learn_stock_pages", {
  symbol: text("symbol").primaryKey(),
  content: jsonb("content").$type<LearnStockContent>().notNull(),
  facts: jsonb("facts").$type<LearnStockFacts>().notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LearnSection = { heading: string; paragraphs: string[] };

export const learnArticles = pgTable("learn_articles", {
  slug: text("slug").primaryKey(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  intro: text("intro").notNull(),
  sections: jsonb("sections").$type<LearnSection[]>().notNull(),
  extra: jsonb("extra").$type<{ movers?: { symbol: string; changePercent: number }[]; terms?: string[] }>(),
  publishedOn: text("published_on").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
