import type { Request, Response } from "express";
import User from "../model/User.js";
import jwt from "jsonwebtoken";

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, name, image } = req.body;
        console.log(req.body);

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name,
                image
            });
        }

        const token = jwt.sign(
            { userId: user._id },
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

    } catch (error: any) {
        res.status(500).json({
            message: error.message,
        });
    }
};