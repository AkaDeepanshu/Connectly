import {createRedisClient} from '../../config/redis.js';
import { hashOtp, verifyOtpHash } from '../utils/otp.js';

const redis = createRedisClient();

const OTP_TTL = Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60;
const RESEND_TTL = Number(process.env.OTP_RESEND_COOLDOWN || 30);
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const BLOCK_TTL = Number(process.env.OTP_BLOCK_DURATION || 15) * 60;

const otpkey = (userId : number) => `otp:user:${userId}`;
const resendkey = (userId : number) => `otp:resend:user:${userId}`;
const attemptskey = (userId : number) => `otp:attempts:user:${userId}`;
const blockkey = (userId : number) => `otp:block:user:${userId}`;

// Save OTP for user
export async function saveOtpForUser(userId: number, otp:string){
    const hash = await hashOtp(otp);
    const key = otpkey(userId);

    // set otp and clear attempts in a transaction
    const multi = redis.multi();
    multi.set(key, hash, 'EX', OTP_TTL);
    multi.del(attemptskey(userId));
    await multi.exec();
}

// Check if user can request new OTP
export async function canResendOtp(userId:number){
    const exists = await redis.exists(resendkey(userId));
    return exists === 0;
}

// Set resend cooldown
export async function setResendCooldown(userId:number){
    await redis.set(resendkey(userId),'1','EX', RESEND_TTL);
}

// Verify OTP for user
export async function verifyOtpForUser(userId:number, otp:string): Promise<
    | {success:true}
    | {success:false; reason:'invalid' | 'not_found' | 'blocked'; attempts?:number}>{

        if(await redis.exists(blockkey(userId))){
            return {success:false, reason:'blocked'};
        }

        const key = otpkey(userId);
        const storedHash = await redis.get(key);
        if(!storedHash){
            return { success:false, reason:'not_found' };
        }

        const isValid = await verifyOtpHash(otp, storedHash);
        if(!isValid){
            const attempts = await redis.incr(attemptskey(userId));
            // keep attempt key ttl sync with OTP ttl
            const ttl = await redis.ttl(key);
            if(ttl > 0) await redis.expire(attemptskey(userId),ttl);

            if(attempts >= MAX_ATTEMPTS){
                // block user
                await redis.set(blockkey(userId),'1','EX', BLOCK_TTL);
                // clear otp and attempts
                const multi = redis.multi();
                multi.del(key);
                multi.del(attemptskey(userId));
                await multi.exec();
            }
            return { success:false, reason:'invalid',attempts}
        }

        // success: clear keys
        await redis.del(key, attemptskey(userId), resendkey(userId));
        return { success: true};
}

// Delete OTP for user
export async function deleteOtpForUser(userId:number){
    await redis.del(otpkey(userId), attemptskey(userId), resendkey(userId), blockkey(userId));
}