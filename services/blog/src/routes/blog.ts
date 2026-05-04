import express from 'express'
import { getAllBlogs, getBlogsByAuthor, getSingleBlog,deleteBlog} from '../controllers/blog.js';
import { isAuth } from "../middleware/isAuth.js";
import { getSavedBlogs } from '../controllers/saveBlog.js';

const router=express.Router();

router.get("/blog/all",getAllBlogs);
router.get("/blog/saved",isAuth, getSavedBlogs);
router.get("/blog/:id",getSingleBlog);
router.get("/blog/author/:id",getBlogsByAuthor);
router.delete("/blog/:id", isAuth, deleteBlog);
 

export default router;