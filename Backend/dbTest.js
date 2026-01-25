import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

const { PGUSER, PGPASSWORD, PGHOST, PGDATABASE } = process.env;

const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

async function testDb() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("✅ DB connected:", result);
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
}

testDb();
// how to run it 