import { prisma } from './shared/connections';
import { sigUpCredentials } from './shared/interfaces.d';


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
