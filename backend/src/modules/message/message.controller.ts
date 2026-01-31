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
  const { messageId } = req.params;
  const userId = req.userId;

  if(!userId) {
    throw new UnauthorizedError("User not authorized");
  }
  if(!messageId || Array.isArray(messageId)) {
    throw new BadRequestError("Invalid messageId");
  }

  const messsage = await MessageService.getMessageById(BigInt(messageId), BigInt(userId));

  res.status(200).json({
    success: true,
    data: messsage,
  });
};

export const deleteMessageHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  // Implementation for deleting a message
  const { messageId } = req.params;
  const userId = req.userId;
  if(!userId) {
    throw new UnauthorizedError("User not authorized");
  }
  if(!messageId || Array.isArray(messageId)) {
    throw new BadRequestError("Invalid messageId");
  }
  await MessageService.deleteMessage(BigInt(messageId), BigInt(userId));

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
};

export const updateMessageHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  // Implementation for updating a message
  const { messageId } = req.params;
  const { newContent } = req.body;
  const userId = req.userId;
  if(!userId) {
    throw new UnauthorizedError("User not authorized");
  }
  if(!messageId || Array.isArray(messageId)) {
    throw new BadRequestError("Invalid messageId");
  }
  if(!newContent || typeof newContent !== "string") {
    throw new BadRequestError("Invalid newContent");
  }
  const updatedMessage = await MessageService.updateMessage({
    messageId: BigInt(messageId),
    userId: BigInt(userId),
    newContent,
  });
  res.status(200).json({
    success: true,
    data: updatedMessage,
  });
};

export const searchMessagesHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  // Implementation for searching messages in a room
};
