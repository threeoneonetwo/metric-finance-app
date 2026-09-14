import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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

export const briefings = pgTable("briefings", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriberId: uuid("subscriber_id").notNull(),
  tickers: jsonb("tickers").$type<string[]>().notNull().default([]),
  html: text("html").notNull(),
  text: text("text").notNull(),
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
