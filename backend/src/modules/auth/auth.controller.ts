import type { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../../errors/http.error.js";
import { AuthService } from "./auth.service.js";


// signup controller
export const signupHandler = async (req: Request, res: Response) => {
  const { name, username, email, password, confirmPassword } = req.body;

  // Validations
  if (!name || !username || !email || !password || !confirmPassword) {
    throw new BadRequestError("All fields are required");
  }

  const user = await AuthService.signup({
    name,
    username,
    email,
    password,
    confirmPassword,
  });

  return res.status(201).json({
    message:
      "User created successfully. OTP sent to your email please verify your account.",
    newUser: {
      name: user.name,
      username: user.username,
      email: user.email,
      status: user.status,
    },
    requiresVerification: true,
    redirect: "/verify-otp",
  });
};

// login controller
export const loginHandler = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  // Validations
  if (!identifier || !password) {
    throw new BadRequestError("Identifier and password are required");
  }

  const result = await AuthService.login(identifier, password);

  if (result.requiresVerification) {
    return res.status(403).json({
      message:
        "User not verified. OTP sent to your email please verify your account.",
      email: result.email,
      redirect: result.redirect,
    });
  }

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return res.status(200).json({
    message: "Login successful",
    user: result.user,
    accessToken: result.accessToken,
  });
};

// check username availability controller
export const checkUsernameAvailabilityHandler = async (
  req: Request,
  res: Response,
) => {
  const { username } = req.query;

  // Validations
  if (!username) {
    return res.status(400).json({
      message: "Username is required",
    });
  }

  const isAvailable = await AuthService.checkUsernameAvailability(
    username as string,
  );

  if (!isAvailable) {
    return res.status(409).json({
      available: false,
      message: "Username is already taken",
    });
  }

  return res.status(200).json({
    available: true,
    message: "Username is available",
  });
};

// verify otp controller
export const verifyOtpHandler = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  // Validations
  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP is required",
    });
  }

  const result = await AuthService.verifyOtp(email, otp);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return res.status(200).json({
    message: "OTP verified successfully",
    accessToken: result.accessToken,
    user: result.user,
  });
};

// refresh access token controller
export const refreshAccessTokenHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new BadRequestError("Refresh token not found");
  }

  const result = await AuthService.refreshAccessToken(refreshToken);

  return res.status(200).json({
    accessToken: result.accessToken,
  });
};
