import express,  { type Request, type Response } from "express";
import authRoutes from './routes/auth.route.js'

const app = express();
const PORT = process.env.PORT || 5000;

// index.ts
(BigInt.prototype as any).toJSON = function () {
  return this.toString(); // or Number(this) if safe
};


// Middleware
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript Express server!");
});
app.use("/api/v1/auth", authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
