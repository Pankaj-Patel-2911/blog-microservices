import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";

export const createBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, blogcontent, category } = req.body;
  const file = req.file;

  
  if (!title || !description || !blogcontent || !category) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  
  if (!file) {
    return res.status(400).json({
      message: "No file to upload",
    });
  }

  
 if (!req.user) {
  return res.status(401).json({
    message: "Unauthorized",
  });
}

  
  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    return res.status(400).json({
      message: "Failed to generate buffer",
    });
  }

  
  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
    folder: "blogs",
  });

  
  const result = await sql`
    INSERT INTO blogs (title, description, image, blogcontent, category, author) 
    VALUES (${title}, ${description}, ${cloud.secure_url}, ${blogcontent}, ${category}, ${req.user}) 
    RETURNING *
  `;

  
  res.status(201).json({
    message: "Blog Created Successfully",
    blog:  result[0],
  });
});

export const updateBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, blogcontent, category } = req.body;
  const file = req.file;

  const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

  if (!blog.length) {
    return res.status(404).json({
      message: "No blog with this id",
    });
  }

  const existingBlog = blog[0]!;

  if (existingBlog.author !== req.user) {
    return res.status(401).json({
      message: "You are not the author of this blog",
    });
  }

  let imageUrl = existingBlog.image;

  if (file) {
    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      return res.status(400).json({
        message: "Failed to process image",
      });
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });

    imageUrl = cloud.secure_url;
  }

  const updatedBlog = await sql`
    UPDATE blogs 
    SET 
      title = ${title || existingBlog.title},
      description = ${description || existingBlog.description},
      blogcontent = ${blogcontent || existingBlog.blogcontent},
      category = ${category || existingBlog.category},
      image = ${imageUrl}
    WHERE id = ${id}
    RETURNING *
  `;

  res.json({
    message: "Blog updated successfully",
    blog: updatedBlog[0],
  });
});