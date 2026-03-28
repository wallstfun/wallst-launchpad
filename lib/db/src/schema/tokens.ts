import { pgTable, text, serial, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

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

export const insertTokenSchema = createInsertSchema(tokensTable).omit({ id: true, createdAt: true });
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokensTable.$inferSelect;
