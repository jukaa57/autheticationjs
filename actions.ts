import { prisma } from './shared/connections';
import { signInCredentials, signUpCredentials } from './shared/interfaces.d';


export async function userExists(email: string) {
    const userExists = await prisma.user.findFirst({
        where: {
            email: email
        }
    })
    return userExists ? true : false
}

export async function createAccout(data: signUpCredentials) {
    await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            hashpassword: data.password,
            saltkey: data.saltKey as string,
        },
    })
}

export async function getHashPass(data: signInCredentials) {
    const hash = await prisma.user.findFirst({
        where: {
            email: data.email
        }, select: {
            hashpassword: true,
            saltkey: true
        }
    })
    return hash

    // await prisma.user.create({
    //     data: {
    //         username: data.username,
    //         email: data.email,
    //         hashpassword: data.password,
    //         saltkey: data.saltKey as string,
    //     },
    // })
}