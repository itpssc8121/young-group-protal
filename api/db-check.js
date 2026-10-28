
import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        status: "error",
        message: "DATABASE_URL is not configured"
      });
    }

    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT NOW() AS database_time`;

    return res.status(200).json({
      status: "ok",
      message: "Neon Database connected successfully",
      database_time: result[0].database_time
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Database connection failed"
    });
  }
}
