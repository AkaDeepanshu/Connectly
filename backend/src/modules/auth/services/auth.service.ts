import jwt from 'jsonwebtoken';

interface DecodedToken {
    userId: string;
}

export const verifyJWTAndGetUser = async (token:string)=>{
    if(!token) throw new Error("Token not provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    if(!decoded || !decoded.userId) throw new Error("Invalid token");

    return decoded.userId;
}