import bcrypt from "bcryptjs";
import {
  BadRequestError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from "../../errors/http.error.js";
import prisma from "../../services/prisma.js";
import { createAndSendOtp } from "./services/otp.verification.service.js";
import { UserStatus } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../common/utils/jwt.js";
import { getRedisCache } from "../../services/redis.js";
import { verifyOtpForUser } from "../../common/services/otp.redis.service.js";
import jwt from "jsonwebtoken";

export interface SignupDto {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const redis = getRedisCache();

export class AuthService {
  static async signup(dto: SignupDto) {
    // Implementation for user signup

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestError("Password and confirm password do not match");
    }

    const existingUser = await prisma.$queryRaw<any[]>`
        select 1 from "User" where email = ${dto.email}`;

    if (existingUser.length > 0) {
      throw new BadRequestError("User already exists with this email");
    }

    const existingUsername = await prisma.$queryRaw<any[]>`
        select 1 from "User" where username = ${dto.username}`;

    if (existingUsername.length > 0) {
      throw new BadRequestError("Username is already taken");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.$queryRaw<any[]>`
        insert into "User" (name, username, email, password)
        values (${dto.name}, ${dto.username}, ${dto.email}, ${hashedPassword})
        returning id, name, username, email, status`;

      console.log("User created:", newUser[0]);

      await createAndSendOtp(Number(newUser[0].id), newUser[0].email);

      return newUser[0];
    });

    return user;
  }

  static async login(identifier: string, password: string) {
    const users = await prisma.$queryRaw<any[]>`
    select * from "User" where email = lower(${identifier}) or username = lower(${identifier}) limit 1`;

    if (users.length === 0) {
      throw new NotFoundError("User not found");
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError("Invalid password");
    }

    if (user.status === UserStatus.pending) {
      await createAndSendOtp(Number(user.id), user.email);

      return {
        requiresVerification: true,
        email: user.email,
        redirect: "/verify-otp",
      };
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await redis.set(
      `refresh:${user.id}`,
      refreshToken,
      "EX",
      30 * 24 * 60 * 60,
    );

    return {
      requiresVerification: false,
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        username: user.username,
        name: user.name,
        status: user.status,
      },
    };
  }

  static async checkUsernameAvailability(username: string) {
    const user = await prisma.$queryRaw<any[]>`
    select 1 from "User" where username = ${username} limit 1`;

    return user.length === 0;
  }

  static async verifyOtp(email: string, otp: string) {
    const user = await prisma.$queryRaw<any[]>`
    select * from "User" where email = ${email} limit 1`;

    if (user.length === 0) {
      throw new NotFoundError("User Not Found");
    }

    const userId = Number(user[0].id);
    const result = await verifyOtpForUser(userId, otp);
    if (!result.success) {
      if (result.reason === "blocked")
        throw new TooManyRequestsError(
          "Too many invalid attempts. OTP verification is temporarily blocked. Please try again later.",
        );
      if (result.reason === "not_found")
        throw new NotFoundError(
          "OTP not found or expired. Please request a new OTP.",
        );
      throw new BadRequestError("Invalid OTP");
    }

    await prisma.$queryRaw<any[]>`
    update "User" set status = ${UserStatus.verified} where id = ${userId}`;

    const accessToken = generateAccessToken(user[0].id);
    const refreshToken = generateRefreshToken(user[0].id);

    await redis.set(`refresh:${userId}`, refreshToken, "EX", 30 * 24 * 60 * 60);

    return {
      accessToken,
      refreshToken,
      user: {
        email: user[0].email,
        username: user[0].username,
        name: user[0].name,
        status: UserStatus.verified,
      },
    };
  }

  static async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token not found");
    }

    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string,
    );
    const storedToken = await redis.get(`refresh:${decoded.userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }
    const accessToken = generateAccessToken(BigInt(decoded.userId));
    return { accessToken };
  }
}
