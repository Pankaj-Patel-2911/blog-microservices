import { redisClient } from "../server.js";
import TryCatch from "../utils/TryCatch.js";
import { sql } from "../utils/db.js";
import axios from 'axios';
export const getAllBlogs = TryCatch(async (req, res) => {
  const{ searchQuery = "",
   category = ""}=req.query;

   const cacheKey=`blogs:${searchQuery}:${category}`;
   const cached= await redisClient.get(cacheKey);

   if(cached){
    console.log("Serving get All Blog from Redis cache");
    res.json(JSON.parse(cached));
    return;
   }

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
  console.log("Serving get All Blog from db");
  await redisClient.set(cacheKey,JSON.stringify(blogs),{EX: 3600});

  res.json({
    count: blogs.length,
    blogs,
  });
});

export const getSingleBlog = TryCatch(async (req, res) => {
  const { id } = req.params;

  const cacheKey = `blog:${id}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    console.log("Serving single blog from Redis cache");
    res.json(JSON.parse(cached));
    return;
  }

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

  const responseData = {
    blog: existingBlog,
    author: userRes.data,
  };

  console.log("Serving single blog from DB");

  
  await redisClient.set(cacheKey, JSON.stringify(responseData), {
    EX: 3600,
  });

  res.json(responseData);
});