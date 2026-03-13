import  express  from "express";
import { getUserProfile, loginUser, myProfile, updateProfilePic, updateUser } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";

const router=express.Router();

router.post("/login",loginUser);
router.get("/me",isAuth,myProfile);
router.get("/user/:id",getUserProfile);
router.put("/user/update",isAuth,updateUser);
router.put("/user/update/pic",isAuth,uploadFile,updateProfilePic);



export default router;
