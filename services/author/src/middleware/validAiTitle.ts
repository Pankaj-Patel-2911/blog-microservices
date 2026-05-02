import type { Request, Response, NextFunction } from "express";

export const validateAiTitle = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({
      message: "Valid text is required",
    });
  }

  text = text.trim();

  if (text.length === 0) {
    return res.status(400).json({
      message: "Text cannot be empty",
    });
  }

  if (text.length > 200) {
    return res.status(400).json({
      message: "Text too long (max 200 characters)",
    });
  }

  // Optional: enforce minimum quality input
  if (text.length < 5) {
    return res.status(400).json({
      message: "Text too short to process",
    });
  }

  // overwrite cleaned value
  req.body.text = text;

  next();
};