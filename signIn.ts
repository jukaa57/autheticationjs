import { signInCredentials, signUpCredentials } from "./shared/interfaces";
import cryptoJs from 'crypto-js'
import { getAccountFull, setAccessToken } from "./actions";
import { createValidateCode, now, sendEmailSignUpValidation, sendTwoFactorValidation } from "./shared/util";
import { redisClient } from "./shared/connections";

export async function handleSignIn(data: signInCredentials) {
    const getAccount = await getAccountFull(data)   
    const hash = await HashComparator(data.password, getAccount)
    if(hash === true) {
        if(getAccount?.twofactors === 'true') {
            createValidateCode()
            const validationCode = await redisClient.get('validationCode');
            // NEED to change this key parameter
            redisClient.hSet(`signin:${validationCode}`, {'id': getAccount.id, 'email':getAccount.email})
            let send = sendTwoFactorValidation(data.email, validationCode)
            return send
        } else {
            accessTokenCreator(getAccount)
            return 200
        }
    } else {
        return 500
    }
}

async function HashComparator(password: string, data: any ) {
    let concat = password + data.saltkey
    let hash = cryptoJs.SHA256(concat)
    if(hash.toString(cryptoJs.enc.Hex) !== data.hashpassword) {
        return false
    }
    return true
}

export async function accessTokenCreator(data: any) {
    let concat = data.id + data.email + now
    let accessToken = cryptoJs.SHA256(concat)
    setAccessToken(data, accessToken.toString(cryptoJs.enc.Hex))
}