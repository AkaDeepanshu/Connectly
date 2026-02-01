import { NextFunction, Request, Response } from "express";
import { verifyJWTAndGetUser } from "./services/token.service.js";
import { AuthRequest } from "../../types/auth.js";


export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // check for token in headers or cookies
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // verify token and get user id
    req.userId = await verifyJWTAndGetUser(token);
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
