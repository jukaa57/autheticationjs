import { createClient } from 'redis';
export const redisClient = createClient();
import { PrismaClient } from "@prisma/client";

export async function redisConnect() {
    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();
}

export const prisma = new PrismaClient()