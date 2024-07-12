import { prisma } from './shared/connections';
import { signInCredentials, signUpCredentials } from './shared/interfaces.d';


export async function userExists(email: string) {
    const userExists = await prisma.users.findFirst({
        where: {
            email: email
        }
    })
    return userExists ? true : false
}

export async function createAccout(data: signUpCredentials) {
    await prisma.users.create({
        data: {
            username: data.username,
            email: data.email,
            hashpassword: data.password,
            saltkey: data.saltKey as string,
        },
    })
}

export async function getAccountFull(data: signInCredentials) {
    const account = await prisma.users.findFirst({
        where: {
            email: data.email
        }
    })
    return account
}

export async function setAccessToken(data: signInCredentials, accessToken: string) {
    await prisma.accessToken.create({
        data: {
            userId: data.id as string,
            token: accessToken
        },
    })
}