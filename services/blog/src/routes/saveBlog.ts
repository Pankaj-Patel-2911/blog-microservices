import express from "express";
import {
  saveBlog,
  unsaveBlog,
  getSavedBlogs,
} from "../controllers/saveBlog.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/blog/save", isAuth, saveBlog);
router.delete("/blog/unsave", isAuth, unsaveBlog);


export default router;