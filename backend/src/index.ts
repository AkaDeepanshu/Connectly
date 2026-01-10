import express,  { type Request, type Response } from "express";
import http from 'http';
import authRoutes from './modules/auth/auth.route.js'
import cookieParser from "cookie-parser";
import SocketService from "./socket/socket.service.js";

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
const server = http.createServer(app);
const socketServer = new SocketService(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;