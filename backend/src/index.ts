import express,  { type Request, type Response } from "express";
import http from 'http';
import authRoutes from './modules/auth/auth.route.js'
import cookieParser from "cookie-parser";
import SocketService from "./socket/socket.service.js";
import { startMessageConsumer } from "./services/kafka.js";

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

// Create HTTP server and attach Socket.io
const httpServer = http.createServer(app);
const socketService = new SocketService(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

socketService.initListeners();
startMessageConsumer();
export default app;