import { Server } from "socket.io";
import http from "http";
import { createRedisClient } from "../config/redis.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { socketAuthMiddleware } from "./socket.middleware.js";
import { registerChatEvents } from "./events/chat.events.js";

class SocketService {
  public io: Server;

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        allowedHeaders: ["*"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Register Redis adaptor
    const pubClient = createRedisClient();
    const subClient = pubClient.duplicate();

    this.io.adapter(createAdapter(pubClient, subClient));

    // register auth middleware
    // this.io.use((socket, next)=>socketAuthMiddleware(socket as any, next));

    // register chat handlers
    registerChatEvents(this.io);

    // subscribe the persisted redis channel
    const subscriber = createRedisClient();
    subscriber.subscribe("MESSAGE_PERSISTED_CHANNEL", (err, count) => {
      if (err) console.log("Redis Subscribe Error:", err);
      else console.log(`Subscribed to ${count} channel(s).`);
    });

    subscriber.on("message", (channel, message) => {
      if (channel !== "MESSAGE_PERSISTED_CHANNEL") return;
      try {
        const msg = JSON.parse(message);
        // emit to the room
        this.io.to(`room:${msg.room_id}`).emit("message", msg);
      } catch (error) {
        console.log("Error parsing message from Redis:", error);
      }
    });

    console.log("SocketService initialized");
  }
}

export default SocketService;
