import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URI = process.env.REDIS_URI as string;

let publisher :Redis | null = null;
let subscriber :Redis | null = null;
let cache:Redis | null = null;

export const getPublisher = () => {
    if(!publisher){
        publisher = new Redis(REDIS_URI);
        console.log("Created new Redis publisher");
    }
    return publisher;
}

export const getSubscriber = () => {
    if(!subscriber){
        subscriber = new Redis(REDIS_URI);
        console.log("Created new Redis subscriber");
    }
    return subscriber;
}

export const getRedisCache = () => {
    if(!cache){
        cache = new Redis(REDIS_URI);
        console.log("Created new Redis cache client");
    }
    return cache;
}
