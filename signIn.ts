import { signInCredentials } from "./shared/interfaces";
import crypto from "crypto";
import cryptoJs from 'crypto-js'
import { createAccout, getHashPass } from "./actions";

export async function handleSignIn(data: signInCredentials) {
    const getHash = await getHashPass(data)
    
    const hash = HashCompator(data.password, getHash)
    // const account = {...data, password: hash.hashPassword, saltKey: hash.saltKey}
    console.log(hash)
    // crea1teAccout(account).then((res) => res).catch(err => err.message)
}

async function HashCompator(password: string, data: any ) {

    let concat = password + data.saltKey
    let hash = cryptoJs.SHA256(concat)
    if(hash.toString(cryptoJs.enc.Hex) !== data.hashPassword) {
        return false
    }
    return true

}