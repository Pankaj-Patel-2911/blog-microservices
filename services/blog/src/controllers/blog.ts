import TryCatch from "../utils/TryCatch.js";
import { sql } from "../utils/db.js";
import axios from 'axios';
export const getAllBlogs = TryCatch(async (req, res) => {
  const searchQuery = req.query.searchQuery as string | undefined;
  const category = req.query.category as string | undefined;

  let blogs;

  if (searchQuery && category) {
    blogs = await sql`
      SELECT * FROM blogs 
      WHERE 
        (title ILIKE ${"%" + searchQuery + "%"} 
        OR description ILIKE ${"%" + searchQuery + "%"}) 
        AND category = ${category}
      ORDER BY created_at DESC
    `;
  } else if (searchQuery) {
    blogs = await sql`
      SELECT * FROM blogs 
      WHERE 
        (title ILIKE ${"%" + searchQuery + "%"} 
        OR description ILIKE ${"%" + searchQuery + "%"})
      ORDER BY created_at DESC
    `;
  } else if (category) {
    blogs = await sql`
      SELECT * FROM blogs 
      WHERE category = ${category}
      ORDER BY created_at DESC
    `;
  } else {
    blogs = await sql`
      SELECT * FROM blogs 
      ORDER BY created_at DESC
    `;
  }

  res.json({
    count: blogs.length,
    blogs,
  });
});

export const getSingleBlog = TryCatch(async (req, res) => {
  const { id } = req.params;

  const blog = await sql`
    SELECT * FROM blogs WHERE blogid = ${id}
  `;

  if (!blog.length) {
    return res.status(404).json({
      message: "Blog not found",
    });
  }

  const existingBlog = blog[0]!;

  const userRes = await axios.get(
    `${process.env.USER_SERVICE}/api/v1/user/${existingBlog.author}`
  );

  res.json({
    blog: existingBlog,
    author: userRes.data,
  });
});