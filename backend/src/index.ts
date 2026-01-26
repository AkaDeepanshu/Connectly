import express,  { type Request, type Response } from "express";
import http from 'http';
import authRoutes from './modules/auth/auth.route.js'
import cookieParser from "cookie-parser";
import SocketService from "./socket/socket.service.js";
import { startMessageConsumer } from "./services/kafka.js";
import { registerSocket } from "./socket/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

// To handle BigInt serialization in JSON responses
(BigInt.prototype as any).toJSON = function () {
  return this.toString(); // or Number(this) if safe
};

// Middleware
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);

// Create HTTP server
const httpServer = http.createServer(app);
// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Initialize Socket Service
const socketService = new SocketService(httpServer);
const io = socketService.io;
registerSocket(io);

// Start Kafka consumer
startMessageConsumer();
export default app;