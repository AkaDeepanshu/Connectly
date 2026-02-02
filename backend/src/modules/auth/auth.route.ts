import express from "express";
import {checkUsernameAvailabilityHandler, loginHandler, refreshAccessTokenHandler, signupHandler, verifyOtpHandler} from './auth.controller.js';
const router = express.Router();

router
    .post("/signup",signupHandler)
    .post("/login", loginHandler)
    .get("/check-username", checkUsernameAvailabilityHandler)
    .post("/verify-otp", verifyOtpHandler)
    .post("/refresh", refreshAccessTokenHandler)
//     .post("/resend-otp",ResendOtpController)


export default router;
