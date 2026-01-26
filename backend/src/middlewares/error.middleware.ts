import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Known / expected errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Prisma errors (optional, basic)
  if (err?.code === "P2002") {
    return res.status(409).json({
      status: "error",
      message: "Duplicate resource",
    });
  }

  // Unknown / programming errors
  console.error("UNHANDLED ERROR 💥", err);

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
