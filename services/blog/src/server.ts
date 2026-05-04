import express from "express";
import dotenv from "dotenv";
import blogRoutes from "./routes/blog.js";
import saveBlogRoutes from "./routes/saveBlog.js";
import { createClient } from "redis";
import { startCacheConsumer } from "./utils/consumer.js";
import commentRoutes from "./routes/comment.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

const port = process.env.PORT;

startCacheConsumer();

// 🔥 REDIS SETUP (FIXED)
export const redisClient = createClient({
  url: process.env.REDIS_URL!,
});

// ✅ handle errors (prevents crash)
redisClient.on("error", (err) => {
  console.log("❌ Redis Error:", err.message);
});

redisClient.on("end", () => {
  console.log("⚠️ Redis connection closed");
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

// ✅ safe connect
(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis");
  } catch (err) {
    console.log("❌ Redis connection failed:", err);
  }
})();

// ✅ routes
app.use("/api/v1", blogRoutes);
app.use("/api/v1", saveBlogRoutes);
app.use("/api/v1", commentRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});