import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import {v2 as cloudinary} from 'cloudinary';

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

export const updateProfilePic = TryCatch(async (req: AuthenticatedRequest, res) => {

    const file = req.file;

    if (!file) {
        res.status(400).json({
            message: "No file to upload",
        });
        return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Failed to generate buffer",
        });
        return;
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs",
    });

    const user = await User.findByIdAndUpdate(
        req.user,
        {
            image: cloud.secure_url
        },
        { new: true }
    );

    if (!user) {
        res.status(404).json({
            message: "User not found"
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
        message: "User Profile pic Updated",
        token,
        user,
    });
});