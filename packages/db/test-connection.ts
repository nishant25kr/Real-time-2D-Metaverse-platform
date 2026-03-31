import { PrismaClient } from "./generated/prisma/index.js";
import "dotenv/config";

const prisma = new PrismaClient({});

async function main() {
  try {
    console.log("Connecting with native Prisma engine to:", process.env.DATABASE_URL?.split("@")[1]);
    
    await prisma.$connect();
    console.log("✅ Prisma connected!");
    
    console.log("Testing Prisma query...");
    const userCount = await prisma.user.count();
    console.log(`📊 Currently ${userCount} users in database.`);
    
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
