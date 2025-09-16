import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL as string
});

redis.on('error', err => console.log('Redis Client Error', err));
redis.on('connect', ()=> console.log("Redis connected successfully"));

(async ()=>{
    await redis.connect();
})();

export default redis;


