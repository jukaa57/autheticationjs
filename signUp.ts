import { signUpCredentials } from "./shared/interfaces";
import crypto from "crypto";
import cryptoJs from 'crypto-js'
import { createAccout } from "./actions";

export function createSignUp(data: signUpCredentials) {
    const hash = HashConstructor(data.password)
    const account = {...data, password: hash.hashPassword, saltKey: hash.saltKey}
    
    createAccout(account).then((res) => res).catch(err => err.message)
}

function HashConstructor(password: string) {
    const saltKey = crypto.randomBytes(32).toString('hex')
    let concat = password + saltKey
    let hashPassword = cryptoJs.SHA256(concat)
    return {
        saltKey: saltKey,
        hashPassword: hashPassword.toString(cryptoJs.enc.Hex)
    }
}