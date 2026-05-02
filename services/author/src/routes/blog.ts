import express from 'express';
import { isAuth } from '../middleware/isAuth.js';
import uploadFile from '../middleware/multer.js';
import { aiBlogResponse, aiDescriptionResponse, aiTitleResponse, createBlog, deleteBlog, updateBlog } from '../controllers/blog.js';
import { validateAiTitle } from '../middleware/validAiTitle.js';



const router = express.Router();

router.post("/blog/new", isAuth, uploadFile, createBlog);
router.put("/blog/:id", isAuth, uploadFile, updateBlog);
router.delete("/blog/:id", isAuth,deleteBlog);
router.post("/ai/title",isAuth,validateAiTitle,aiTitleResponse);
router.post("/ai/description",isAuth,aiDescriptionResponse);
router.post("/ai/blog",isAuth,aiBlogResponse);


export default router;
