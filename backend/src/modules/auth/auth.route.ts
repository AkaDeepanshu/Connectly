import express from "express";
import {checkUsernameAvailability, login, refreshAccessToken, signupHandler, verifyOtp} from './auth.controller.js';
const router = express.Router();

router
    .post("/signup",signupHandler)
    .post("/login", login)
    .post("/check-username", checkUsernameAvailability)
    .post("/verify-otp", verifyOtp)
    .post("/refresh", refreshAccessToken)
//     .post("/resend-otp",ResendOtpController)


export default router;
