import TryCatch from "../utils/TryCatch.js";
import { sql } from "../utils/db.js"; 
import type { AuthenticatedRequest } from "../middleware/isAuth.js";

// 🔥 SAVE BLOG
export const saveBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { blogid } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!blogid) {
    return res.status(400).json({ message: "Blog ID required" });
  }

  // ✅ check if blog exists
  const blog = await sql`
    SELECT blogid FROM blogs WHERE blogid = ${blogid}
  `;

  if (!blog.length) {
    return res.status(404).json({
      message: "Blog not found",
    });
  }

  // ✅ prevent duplicate save
  const existing = await sql`
    SELECT 1 FROM savedblogs 
    WHERE userid = ${req.user} AND blogid = ${blogid}
  `;

  if (existing.length) {
    return res.status(200).json({
      message: "Already saved",
    });
  }

  await sql`
    INSERT INTO savedblogs (userid, blogid)
    VALUES (${req.user}, ${blogid})
  `;

  res.status(201).json({ message: "Blog saved" });
});

// 🔥 UNSAVE BLOG
export const unsaveBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { blogid } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!blogid) {
    return res.status(400).json({ message: "Blog ID required" });
  }

  await sql`
    DELETE FROM savedblogs
    WHERE userid = ${req.user} AND blogid = ${blogid}
  `;

  res.json({ message: "Blog removed from saved" });
});

// 🔥 GET SAVED BLOGS
export const getSavedBlogs = TryCatch(async (req: AuthenticatedRequest, res) => {
  console.log("USER:", req.user);

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const blogs = await sql`
      SELECT b.*
      FROM blogs b
      INNER JOIN savedblogs s 
      ON b.blogid = s.blogid
      WHERE s.userid = ${req.user}
      ORDER BY s.created_at DESC
    `;

    res.json({ blogs });
  } catch (error) {
    console.error("SQL ERROR:", error);
    res.status(500).json({ message: "DB Error", error });
  }
});