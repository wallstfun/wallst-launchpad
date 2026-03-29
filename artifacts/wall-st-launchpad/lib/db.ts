import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  pgTable,
  text,
  serial,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Schema ────────────────────────────────────────────────────────────────

export const tokensTable = pgTable("tokens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ticker: text("ticker").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  bondingCurveTarget: real("bonding_curve_target").notNull().default(42),
  solRaised: real("sol_raised").notNull().default(0),
  creatorWallet: text("creator_wallet"),
  mintAddress: text("mint_address"),
  migrated: boolean("migrated").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Token = typeof tokensTable.$inferSelect;

// ─── Singleton DB connection ───────────────────────────────────────────────

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set.");
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _db = drizzle(pool, { schema: { tokensTable } });
  }
  return _db;
}
