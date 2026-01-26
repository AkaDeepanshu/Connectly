import { Socket } from "socket.io";
import { verifyJWTAndGetUser } from "../modules/auth/services/auth.service.js";
import { SocketUser } from "../types/socket.js";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("No token provided"));
  }

  try {
    const userId = await verifyJWTAndGetUser(token);
    (socket as SocketUser).userId = userId;
    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
};
