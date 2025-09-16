import express,  { type Request, type Response } from "express";
import authRoutes from './routes/auth.route.js'
import cookieParser from "cookie-parser";

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
