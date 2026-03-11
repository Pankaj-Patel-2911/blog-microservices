import  express  from "express";
import { loginUser } from "../controllers/user.js";

const router=express.Router();

router.post("/login",loginUser);

router.get("/test", (req, res) => {
    res.send("User route working");
});

export default router;
