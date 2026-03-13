import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";

export const loginUser=TryCatch(async(req,res)=>{
    const { email, name, image } = req.body;
        

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name,
                image
            });
        }

        const token = jwt.sign(
            { user: user._id },
            process.env.JWT_SEC as string,
            {
                expiresIn: "6d",
            }
        );

        res.status(200).json({
            message:"Login Success",
            user,
            token,
        });
})



export const myProfile=TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = await User.findById(req.user);
    console.log(user);
    res.json(user);

})

export const getUserProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404).json({
            message: "No user found with this Id",
        });
        return;
    }

    res.json(user);
});

export const updateUser = TryCatch(async (req: AuthenticatedRequest, res) => {

    const { name, instagram, linkedin, bio } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user,
        {
            name,
            instagram,
            linkedin,
            bio,
        },
        { new: true }
    );
     if (!user) {
        res.status(404).json({
            message: "User not found",
        });
        return;
    }

    const token = jwt.sign(
        { user: user._id },
        process.env.JWT_SEC as string,
        {
            expiresIn: "6d",
        }
    );

    res.json({
        message: "User Updated",
        token,
        user,
    });

});