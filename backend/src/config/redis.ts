import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URI = process.env.REDIS_URI as string;

export const redisPub = new Redis(REDIS_URI);
export const redisSub = new Redis(REDIS_URI);

export function createRedisClient(){
    console.log("Creating Redis client with URI:", REDIS_URI);
    return new Redis(REDIS_URI);
}

