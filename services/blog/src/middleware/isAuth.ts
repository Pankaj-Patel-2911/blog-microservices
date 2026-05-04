import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: string;
}

interface TokenPayload extends JwtPayload {
  user: string;
}

export const isAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Unauthorized - No token",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        message: "Token missing",
      });
      return;
    }

    const secret = process.env.JWT_SEC;

    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;

    if (!decoded.user) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }

    req.user = decoded.user;

    next();
  } catch (error) {
    console.log("JWT error:", error);

    res.status(401).json({
      message: "Unauthorized - JWT error",
    });
  }
};