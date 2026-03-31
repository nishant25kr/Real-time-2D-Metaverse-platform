import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const isCloud = process.env.DATABASE_URL?.includes("render.com");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isCloud ? { rejectUnauthorized: false } : false,
});

// Avoid crashing on pool errors
pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle database client:", err);
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
export default prisma;

