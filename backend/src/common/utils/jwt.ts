import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateAccessToken = (userId: BigInt) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "30m",
  });
};

export const generateRefreshToken = (userId: BigInt) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};
