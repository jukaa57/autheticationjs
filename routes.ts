import { signInCredentials, signUpCredentials } from './shared/interfaces';
import {app} from './server';
import { createSignUp } from './signUp';
import { createValidateCode, sendEmailSignUpValidation, validateEmail, validatePassword } from './shared/util';
import { userExists } from './actions';
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from './shared/connections';
import { accessTokenCreator, handleSignIn } from './signIn';

export async function Routes() {
    const id = uuidv4();
    app.get('/', (req, res) => {
        res.send('<h1>Welcome!</h1>');
    });

    app.post('/signup', async (req, res, next) => {
        const {username, email, password}: signUpCredentials = req.body
        if(!username || !password || !email) return res.status(500).send('Bad Request \n username, email and password is required')
        if(!validateEmail(email)) return res.status(400).send('Bad Request \n email invalid')

        const isExists = await userExists(email)
        if(isExists) return res.status(400).send('Bad Request \n Email already exists')
        if(!validatePassword(password).pass) return res.status(400).send(`Bad Request \n ${!validatePassword(password).error}.`)

        redisClient.hSet(`credential:${id}`, {username, email, password})
        createValidateCode()
        const validationCode = await redisClient.get('validationCode');
        let send = sendEmailSignUpValidation(email, validationCode)

        if(send === 202) return res.status(202).send('Send code to email!!')
        else return res.status(500).send('Error !!')
    });
    
    app.get('/validate/:code', async (req, res) => {
        const paramsCode = req.params.code
        const validateCode = await redisClient.get('validationCode')
        // Check if code is exipired
        if(!validateCode) return res.status(500).send('code expired!!\n resend a new code!')

        // Check if code is valid
        switch(paramsCode) {
            case 'error':
                res.status(500).send('Invalid code!')
                res.end()
                break
            case undefined:
                res.status(500).send('Invalid code!')
                res.end()
                break
            case null:
                res.status(500).send('Invalid code!')
                res.end()
                break
        }
        if(paramsCode === validateCode ) {
            const credential = JSON.stringify(await redisClient.hGetAll(`credential:${id}`), null, 2)
            if(!credential) return res.status(500).send('Error fetching credential')
            createSignUp(JSON.parse(credential))
            return res.status(200).send('Account successfully')
        } else {
            res.status(500).send('Error: this code is invalid')
            res.end()
        }
    });

    app.get('/revalidate', async(req, res) => {
        const credential = JSON.stringify(await redisClient.hGetAll(`credential:${id}`), null, 2)
        if(!JSON.parse(credential).email) return res.status(500).send('Error: action not found')
        createValidateCode()
        const validationCode = await redisClient.get('validationCode');
        sendEmailSignUpValidation(JSON.parse(credential).email, validationCode)
        return res.status(200).send('Resend successfully')
    });

    app.post('/signin', async(req, res, next) => {
        const {email, password}: signInCredentials = req.body
        if(!email || !password) return res.status(500).send('Bad Request \n email and password is required')
        if(!validateEmail(email)) return res.status(400).send('Bad Request \n email invalid')
        
        const isExists = await userExists(email)
        if(!isExists) return res.status(400).send('Bad Request \n Account not exisits')
        
        const login = await handleSignIn({email, password})
        if(login == 200 ) return res.status(200).send('Access Successfully')
        else if(login == 202) return res.status(202).send('Send code to email!!')
        else return res.status(500).send('Bad Request \n Login failed')
    })

    app.get('/signin/validate/:code', async (req, res) => {
        const paramsCode = req.params.code
        const validateCode = await redisClient.get('validationCode')
        // Check if code is exipired
        if(!validateCode) return res.status(500).send('code expired!!\n resend a new code!')

        // Check if code is valid
        switch(paramsCode) {
            case 'error':
                res.status(500).send('Invalid code!')
                res.end()
                break
            case undefined:
                res.status(500).send('Invalid code!')
                res.end()
                break
            case null:
                res.status(500).send('Invalid code!')
                res.end()
                break
        }
        if(paramsCode === validateCode ) {
            // NEED to change this key parameter
            const credential = JSON.stringify(await redisClient.hGetAll(`signin:${paramsCode}`), null, 2)
            if(!credential) return res.status(500).send('Error fetching credential')
            let data = JSON.parse(credential)

            accessTokenCreator(data)
            return res.status(200).send('Account successfully')
        } else {
            res.status(500).send('Error: this code is invalid')
            res.end()
        }
    });
}