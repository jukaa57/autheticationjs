import { prisma } from './shared/connections';
import { signInCredentials, signUpCredentials } from './shared/interfaces.d';

export async function userExists(email: string) {
  const userExists = await prisma.user.findUnique({
    where: {
      email: email
    }
  })
  return userExists ? true : false
}

export async function createAccout(data: signUpCredentials) {
  try {
    await prisma.auth.create({
      data: {
        email: data.email,
        hashpassword: data.password,
        saltkey: data.saltKey as string,
      },
    }).then(async (e) => 
      await prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          authId: e.id 
        },
      })
    )
  } catch (error) {
    
  }
}

export async function getAccountFull(data: signInCredentials) {
  const account = await prisma.auth.findUnique({
    where: {
      email: data.email
    }
  })
  return account
}

export async function setAccessToken(data: signInCredentials, accessToken: string) {
  await prisma.session.create({
    data: {
      authId: data.id as string,
      token: accessToken
    },
  })
}