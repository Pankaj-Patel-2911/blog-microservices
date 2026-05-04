// routes/comment.ts
import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  addComment,
  getComments,
  deleteComment,
  updateComment,
} from "../controllers/comment.js"

const router = express.Router();

router.post("/comment", isAuth, addComment);
router.get("/comment/:blogid", getComments);
router.put("/comment/:id", isAuth, updateComment);
router.delete("/comment/:id", isAuth, deleteComment);

export default router;