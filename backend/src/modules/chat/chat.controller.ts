import { Response } from "express";
import { AuthRequest } from "../../types/auth.js";
import prisma from "../../config/prisma.js";
import { getOrCreateDirectRoom } from "./chat.service.js";

export const createOrGetDMHandler = async (req: AuthRequest, res: Response)=>{
    try{
        const userId = (req).userId;
        if(!userId) return res.status(401).json({message: "Unauthorized"});

        const {username} = req.body;
        if(!username) return res.status(400).json({message: "Username is required"});

        const other = await prisma.user.findUnique({
            where: {username}
        });
        if(!other) return res.status(404).json({message: "User not found"});

        const result = await getOrCreateDirectRoom(Number(userId) , Number(other.id));
        return res.status(200).json(result);
    }catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
}