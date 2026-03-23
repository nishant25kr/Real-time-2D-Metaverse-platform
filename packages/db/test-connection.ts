import { PrismaClient } from "./generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log("Connecting to:", process.env.DATABASE_URL?.split("@")[1]); // Log host only for safety
    await prisma.$connect();
    console.log("✅ Successfully connected to the Cloud database!");
    
    // Try to count users as a test
    const userCount = await prisma.user.count();
    console.log(`📊 There are currently ${userCount} users in the database.`);
    
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
