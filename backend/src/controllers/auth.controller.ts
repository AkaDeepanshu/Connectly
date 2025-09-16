import type { Request, Response } from "express";
import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { createAndSendOtp } from "../services/otpVerification.service.js";
import { verifyOtpHash } from "../utils/otp.js";

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
    const token = generateToken(user.id);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
      token: token,
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
    const token = generateToken(user.id);

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    };

    return res.status(200).json({
      message: "OTP verified successfully",
      token: token,
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
