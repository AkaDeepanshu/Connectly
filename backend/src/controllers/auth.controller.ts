import type { Request, Response } from "express";
import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../utils/jwt.js";
import { createAndSendOtp } from "../services/otpVerification.service.js";
import { verifyOtpHash } from "../utils/otp.js";
import redis from "../config/redis.js";
import jwt from "jsonwebtoken";

// signup controller
export const signup = async (req: Request, res: Response) => {
  const { name, username, email, password, confirmPassword } = req.body;

  // Validations
  if (!name || !username || !email || !password || !confirmPassword) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Password and confirm password do not match",
    });
  }

  try {
    // check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }
    // check if username is taken
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username is already taken",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log("User created:", user);

    await createAndSendOtp(user.email);

    return res.status(201).json({
      message:
        "User created successfully. OTP sent to your email please verify your account.",
      user,
      redirect: "/verify-otp",
    });
  } catch (err: any) {
    console.error("Error during signup:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// login controller
export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  // Validations
  if (!identifier || !password) {
    return res.status(400).json({
      message: "Identifier and password are required",
    });
  }

  try {
    // find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // check if user is verified
    if (user.status == "pending") {
      await createAndSendOtp(user.email);

      return res.status(403).json({
        message:
          "User is not verified. OTP sent to your email please verify your account.",
        email: user.email,
        redirect: "/verify-otp",
      });
    }

    // Generate token and return user
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateAccessToken(user.id);

    await redis.set(`refresh:${user.id}`, refreshToken, {
      EX: 30 * 24 * 60 * 60,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
      accessToken: accessToken,
    });
  } catch (err: any) {
    console.error("Error during login:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// check username availability controller
export const checkUsernameAvailability = async (
  req: Request,
  res: Response
) => {
  const { username } = req.query;

  // Validations
  if (!username) {
    return res.status(400).json({
      message: "Username is required",
    });
  }

  try {
    // Check if username exists
    const user = await prisma.user.findUnique({
      where: { username: username.toString() },
    });

    if (user) {
      return res.status(200).json({
        message: "Username is taken",
        available: false,
      });
    }

    return res.status(200).json({
      message: "Username is available",
      available: true,
    });
  } catch (err: any) {
    console.error("Error checking username availability:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// verify otp controller
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  // Validations
  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP is required",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    // TODO: get otp from redis

    // const isValid = await verifyOtpHash(otp, hashOtp);
    // if(!isValid){
    //   return res.status(400).json({
    //     message:"Invalid OTP"
    //   });
    // }

    // update status of user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "verified" },
    });

    // generate token
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateAccessToken(user.id);

    await redis.set(`refresh:${user.id}`, refreshToken, {
      EX: 30 * 24 * 60 * 60,
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    };

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json({
      message: "OTP verified successfully",
      accessToken: accessToken,
      user: safeUser,
    });
  } catch (err: any) {
    console.error("Error verifying user otp:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
      });
    }

    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string
    );
    const storedToken = await redis.get(`refresh:${decoded.userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    const accessToken = generateAccessToken(BigInt(decoded.userId));
    return res.status(200).json({
      accessToken,
    });
  } catch (err: any) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};
