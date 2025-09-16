import { sendMail } from "../config/mail.js";
import { generateOtp, hashOtp } from "../utils/otp.js"

export const createAndSendOtp = async (userEmail : string)=>{
    const otp = generateOtp();
    const hash = await hashOtp(otp);

    console.log(`OTP for ${userEmail} is ${otp}`);

    // send email (simple template)
    const subject = `Connectly — Verification code`;
    const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
    const html = `<p>Your verification code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`;

    await sendMail({ to: userEmail, subject, text, html });
}