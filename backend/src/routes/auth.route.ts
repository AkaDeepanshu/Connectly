import express from "express";
import {checkUsernameAvailability, login, signup, verifyOtp} from '../controllers/auth.controller.js';
const router = express.Router();

router
    .post("/signup",signup)
    .post("/login", login)
    .post("/check-username", checkUsernameAvailability)
    .post("/verify-otp", verifyOtp)
//     .post("/resend-otp",ResendOtpController)


export default router;
