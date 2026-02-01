import api from "../axios";
import { LoginPayload, SignupPayload, VerifyOtpPayload } from "./auth.types";

export const authService = {
    login: (payload: LoginPayload)=>
        api.post("/auth/login", payload),

    signup: (payload: SignupPayload)=>
        api.post("/auth/signup", payload),

    verifyOtp: (payload: VerifyOtpPayload)=>
        api.post("/auth/verify-otp", payload),

    refreshToken: ()=>
        api.post("/auth/refresh"),

}