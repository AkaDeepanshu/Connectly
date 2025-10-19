import { sendMail } from "../config/mail.js";
import { generateOtp } from "../utils/otp.js"
import { canResendOtp, saveOtpForUser, setResendCooldown } from "./otp.service.js";

export const createAndSendOtp = async (userId:number,userEmail : string)=>{

    // check resend cooldown
    if(!(await canResendOtp(userId))){
        throw new Error("OTP resend cooldown active");
    }

    // generate and hash otp
    const otp = generateOtp();
    await saveOtpForUser(userId,otp);
    await setResendCooldown(userId);

    // send email (simple template)
    const subject = `Connectly — Verification code`;
    const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
    const html = `<p>Your verification code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`;

    await sendMail({ to: userEmail, subject, text, html });

    if (process.env.NODE_ENV !== 'production') {
        console.log(`DEV OTP for ${userEmail}: ${otp}`);
    }
}