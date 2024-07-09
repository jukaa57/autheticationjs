import { signInCredentials } from "./shared/interfaces";
import cryptoJs from 'crypto-js'
import { getHashPass } from "./actions";

export async function handleSignIn(data: signInCredentials) {
    const getHash = await getHashPass(data)   
    const hash = HashComparator(data.password, getHash)
    return hash
}

async function HashComparator(password: string, data: any ) {
    let concat = password + data.saltkey
    let hash = cryptoJs.SHA256(concat)
    if(hash.toString(cryptoJs.enc.Hex) !== data.hashpassword) {
        return false
    }
    return true
}