import { Response } from "express";
import { AuthRequest } from "../../types/auth.js";
import { BadRequestError, UnauthorizedError } from "../../errors/http.error.js";
import { MessageService } from "./message.services.js";

export const getRoomMessagesHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  const { roomId } = req.params;
  const { cursor, limit } = req.query;
  const userId = req.userId;

  if (!userId) {
    throw new UnauthorizedError();
  }
  if (!roomId || Array.isArray(roomId)) {
    throw new BadRequestError();
  }

  // Parse before cursor safely
  let cursorMessageId: bigint | undefined;
  if (cursor !== undefined) {
    if (Array.isArray(cursor) || typeof cursor !== "string") {
      throw new BadRequestError("Invalid cursor");
    }
    cursorMessageId = BigInt(cursor);
  }

  // Parse limit safely
  let parsedLimit = 20; // default
  if (limit !== undefined) {
    if (Array.isArray(limit) || typeof limit !== "string") {
      throw new BadRequestError("Invalid limit");
    }
    parsedLimit = Math.min(Number(limit), 50);
  }

  const messages = await MessageService.getRoomMessages({
    roomId: BigInt(roomId),
    userId: BigInt(userId),
    cursor: cursorMessageId,
    limit: parsedLimit,
  });

  res.status(200).json({
    success: true,
    data: messages,
  });
};

export const getMessageByIdHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  // Implementation for getting a single message by ID
};

export const deleteMessageHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  // Implementation for deleting a message
};

export const updateMessageHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  // Implementation for updating a message
};

export const searchMessagesHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  // Implementation for searching messages in a room
};
