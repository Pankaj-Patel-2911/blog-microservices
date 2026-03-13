import  express  from "express";
import { loginUser, myProfile } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";

const router=express.Router();

router.post("/login",loginUser);
router.get("/me",isAuth,myProfile);

router.get("/test", (req, res) => {
    res.send("User route working");
});

export default router;
