import { sigUpCredentials } from './shared/interfaces.d';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function userExists(email: string) {
    const userExists = await prisma.user.findFirst({
        where: {
            email: email
        }
    })

    return userExists ? true : false
}


export async function createAccout(data: sigUpCredentials) {
    await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            hashpassword: data.password,
            saltkey: data.saltKey as string,
        },
    })
}