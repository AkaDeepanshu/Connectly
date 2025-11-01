import express from "express";
import {checkUsernameAvailability, login, refreshAccessToken, signup, verifyOtp} from './auth.controller.js';
const router = express.Router();

router
    .post("/signup",signup)
    .post("/login", login)
    .post("/check-username", checkUsernameAvailability)
    .post("/verify-otp", verifyOtp)
    .post("/refresh", refreshAccessToken)
//     .post("/resend-otp",ResendOtpController)


export default router;
