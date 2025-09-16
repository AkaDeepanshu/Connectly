import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (userId: BigInt) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
};
