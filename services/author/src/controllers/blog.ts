import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";
import { invalidateChacheJob } from "../utils/rabbitMq.js";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";



export const createBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, blogcontent, category } = req.body;
  const file = req.file;

  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  console.log("USER:", req.user);

  // ✅ Validate user
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // ✅ Trim inputs
  const safeTitle = title?.trim();
  const safeDescription = description?.trim();
  const safeCategory = category?.trim() || "General";

  // ✅ Clean blog content (remove HTML tags for validation)
  const plainText = blogcontent?.replace(/<[^>]*>/g, "").trim();

  // ✅ Validate fields
  if (!safeTitle || !safeDescription || !plainText) {
    return res.status(400).json({
      message: "Title, description and blog content are required",
    });
  }

  // ❌ Image missing
  if (!file) {
    return res.status(400).json({
      message: "No file to upload",
    });
  }
  // file size (7 mb)
  if (file.size > 7 * 1024 * 1024) {
  return res.status(400).json({
    message: "Image too large (max 5MB)",
  });
}

  // ✅ Convert file to buffer
  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    return res.status(400).json({
      message: "Failed to process image",
    });
  }

  // ✅ Upload to cloudinary
  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
    folder: "blogs",
  });

  // ✅ Insert into DB
  const result = await sql`
    INSERT INTO blogs (title, description, image, blogcontent, category, author) 
    VALUES (${safeTitle}, ${safeDescription}, ${cloud.secure_url}, ${blogcontent}, ${safeCategory}, ${req.user}) 
    RETURNING *
  `;

  // ✅ Invalidate cache
  await invalidateChacheJob(["blogs:*"]);

  return res.status(201).json({
    message: "Blog Created Successfully",
    blog: result[0],
  });
});

export const updateBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, blogcontent, category } = req.body;
  const file = req.file;

  const blog = await sql`SELECT * FROM blogs WHERE blogid = ${id}`;

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
    WHERE blogid = ${id}
    RETURNING *
  `;
   await invalidateChacheJob(["blogs:*",`blogs:${id}`]);

  res.json({
    message: "Blog updated successfully",
    blog: updatedBlog[0],
  });
});

export const deleteBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const blog = await sql`SELECT * FROM blogs WHERE blogid = ${id}`;

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

  await sql`DELETE FROM savedblogs WHERE blogid = ${id}`;
  await sql`DELETE FROM comments WHERE blogid = ${id}`;
  await sql`DELETE FROM blogs WHERE blogid = ${id}`;

  await invalidateChacheJob(["blogs:*",`blogs:${id}`]);

  res.json({
    message: "Blog Deleted Successfully",
  });
});


export const aiTitleResponse = TryCatch(async (req, res) => {
  
  

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({
      message: "Text is required",
    });
  }

  const prompt = `
Correct the grammar of the following blog title.
Return ONLY the corrected title.
Do NOT include quotes, symbols, markdown, or extra text.

Title: ${text}
`;

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
    });

    let result = response.text;

    if (!result) {
      return res.status(400).json({
        message: "AI did not return a response",
      });
    }

    result = result
      .replace(/[*_`~]/g, "")
      .replace(/[\r\n]+/g, " ")
      .replace(/["']/g, "")
      .trim();

    return res.json({
      title: result,
    });

  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({
      message: "AI service failed",
    });
  }
});

export const aiDescriptionResponse = TryCatch(async (req, res) => {
  const { title, description } = req.body;

  if (!title && !description) {
    return res.status(400).json({
      message: "Title or description is required",
    });
  }

  const prompt =
    !description || description.trim() === ""
      ? `Generate one short, clear blog description (max 30 words) for this title: "${title}". Return ONLY the sentence. No explanation, no extra text.`
      : `Correct the grammar of this blog description. Return ONLY the corrected sentence without any extra text: "${description}"`;

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
    });

    let result = response.text;

    if (!result) {
      return res.status(400).json({
        message: "AI did not return a response",
      });
    }

    result = result
      .replace(/[*_`~]/g, "")
      .replace(/[\r\n]+/g, " ")
      .replace(/["']/g, "")
      .trim();

    return res.json({
      description: result, // ✅ FIXED KEY
    });

  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({
      message: "AI service failed",
    });
  }
});

export const aiBlogResponse = TryCatch(async (req, res) => {
  console.log("AI Blog API hitting");

  const { blog } = req.body;

  if (!blog) {
    return res.status(400).json({
      message: "Please provide blog",
    });
  }

  const prompt = `
You will act as a grammar correction engine.

I will provide you with blog content in rich HTML format (from Jodit Editor).

Do NOT generate new content.
Do NOT rewrite or change meaning.
Only correct grammatical, punctuation, and spelling errors.

IMPORTANT:
- Preserve ALL HTML tags exactly
- Preserve inline styles
- Preserve image tags
- Preserve structure, line breaks, formatting

Return ONLY the corrected HTML string.
`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "", // ✅ works with your working setup
    });

    const result = await model.generateContent(`${prompt}\n\n${blog}`);
    const response = await result.response;
    let output = response.text();

    if (!output) {
      return res.status(400).json({
        message: "AI did not return a response",
      });
    }

    // Clean unwanted formatting
    output = output
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .trim();

    return res.json({
      blog: output,
    });

  } catch (error) {
    console.error("AI Blog Error:", error);
    return res.status(500).json({
      message: "AI service failed",
    });
  }
});