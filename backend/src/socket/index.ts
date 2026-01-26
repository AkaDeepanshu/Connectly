import { Server } from "socket.io";
import { registerMessageEvents } from "./events/messages.events.js";
import { startMessageSubscriber } from "./subscribers/message.subscriber.js";

export const registerSocket = (io: Server) => {
  console.log("Registering socket handlers...");

  io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id);
    registerMessageEvents(io, socket);
  });

  // Redis subscribers (run once)
  startMessageSubscriber(io);
};
