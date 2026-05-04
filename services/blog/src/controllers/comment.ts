import TryCatch from "../utils/TryCatch.js";
import { sql } from "../utils/db.js";
import axios from "axios";
import { USER_SERVICE } from "../utils/config.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";

// 🔹 Add Comment
export const addComment = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { comment, blogid } = req.body;

  

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!comment || !blogid) {
    return res.status(400).json({ message: "Missing data" });
  }

  let username = "Anonymous";

  try {
    const userRes = await axios.get(
      `${USER_SERVICE}/api/v1/user/${req.user}`
    );

    

    // 🔥 handle both formats
    username = userRes.data.name || userRes.data.user?.name;
  }catch (err) {
  if (err instanceof Error) {
    console.log("User fetch failed:", err.message);
  } else {
    console.log("User fetch failed:", err);
  }
}
  const inserted = await sql`
    INSERT INTO comments (comment, userid, username, blogid)
    VALUES (${comment}, ${req.user}, ${username}, ${Number(blogid)})
    RETURNING *
  `;

  res.json(inserted[0]);
});

// 🔹 Get Comments
export const getComments = TryCatch(async (req, res) => {
  const { blogid } = req.params;

  const comments = await sql`
    SELECT * FROM comments
    WHERE blogid = ${Number(blogid)}
    ORDER BY created_at DESC
  `;

  res.json({ comments });
});

// 🔹 Update Comment
export const updateComment = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const existing = await sql`
    SELECT * FROM comments WHERE commentid = ${Number(id)}
  `;

  const commentData = existing[0];

  if (!commentData) {
    return res.status(404).json({ message: "Not found" });
  }

  if (commentData.userid !== req.user) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const updated = await sql`
    UPDATE comments
    SET comment = ${comment}
    WHERE commentid = ${Number(id)}
    RETURNING *
  `;

  res.json({ comment: updated[0] });
});

// 🔹 Delete Comment
export const deleteComment = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const existing = await sql`
    SELECT * FROM comments WHERE commentid = ${Number(id)}
  `;

  const commentData = existing[0];

  if (!commentData) {
    return res.status(404).json({ message: "Not found" });
  }

  if (commentData.userid !== req.user) {
    return res.status(403).json({ message: "Not allowed" });
  }

  await sql`
    DELETE FROM comments WHERE commentid = ${Number(id)}
  `;

  res.json({ message: "Deleted" });
});