import express from "express";
import {login, signup} from '../controllers/auth.controller.js';
const router = express.Router();

router
    .post("/signup",signup)
    .post("/login", login)
//     .post("/verify-otp",VerifyOtpController)
//     .post("/resend-otp",ResendOtpController)


export default router;