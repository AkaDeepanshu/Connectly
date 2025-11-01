import bcrypt from "bcryptjs";

//Function to generate Otp
export const generateOtp = ()=>{
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOtp = async (otp:string): Promise<string>=>{
    return await bcrypt.hash(otp,10);
}

export const verifyOtpHash = async (otp: string, hash:string)=>{
    return await bcrypt.compare(otp,hash);
}