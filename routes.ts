import { signInCredentials, signUpCredentials } from './shared/interfaces';
import express from 'express';
import { createSignUp } from './signUp';
import { createValidateCode, generateRandomID, sendEmailSignUpValidation, validateEmail, validatePassword } from './shared/util';
import { userExists } from './actions';
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from './shared/connections';
import { accessTokenCreator, handleSignIn } from './signIn';

export async function Routes(app: express.Application) {
    let blockedValidate = false;
    let blockedSignIn = false;

    app.get('/api/v1/', (req, res) => {
        res.send('<h1>Welcome!</h1>');
    });

    app.post('/api/v1/signup', async (req, res, next) => {
        const {username, email, password}: signUpCredentials = req.body
        let clientId = req.cookies['clientId'];
        if (!clientId) {
            clientId = uuidv4();
            res.cookie('clientId', clientId, { httpOnly: true, secure: true, maxAge: 3600000 });
        }

        if(!username || !password || !email) return res.status(500).send('Bad Request \n username, email and password is required')
        if(!validateEmail(email)) return res.status(400).send('Bad Request \n email invalid')

        const isExists = await userExists(email)
        if(isExists) return res.status(400).send('Bad Request \n Email already exists')
        if(!validatePassword(password).pass) return res.status(400).send(`Bad Request \n ${!validatePassword(password).error}.`)

        redisClient.hSet(`credential:${clientId}`, {username, email, password})
        createValidateCode()
        const validationCode = await redisClient.get('validationCode');
        redisClient.set(`attemptCode:${clientId}`, 3)
        let send = sendEmailSignUpValidation(email, validationCode)

        if(send === 202) return res.status(202).send('Send code to email!!')
        else return res.status(500).send('Error !!')
    });
    
    app.get('/api/v1/validate/:code', async (req, res) => {
        const paramsCode = req.params.code
        // Check if code is valid
        let clientId = req.cookies['clientId'];

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
        let attempt = await redisClient.get(`attemptCode:${clientId}`)
        if(Number(attempt) == 0) {
            blockedValidate = true
            setTimeout(() => blockedValidate = false, 60000 * 5) // 
            return res.status(500).send('operation blocked by too many attempts, wait 5 minutes and try again')
        }
        const validateCode = await redisClient.get(`validationCode:${clientId}`)
        // Check if code is exipired
        if(!validateCode) return res.status(500).send('code expired!!\n resend a new code!')

        if(paramsCode === validateCode ) {
            const credential = JSON.stringify(await redisClient.hGetAll(`credential:${clientId}`), null, 2)
            if(!credential) return res.status(500).send('Error fetching credential')
            createSignUp(JSON.parse(credential))
            await redisClient.del(`attemptCode:${clientId}`)
            await redisClient.del(`validationCode:${clientId}`)
            await redisClient.del(`credential:${clientId}`)
            return res.status(200).send('Account successfully')
        } else {
            redisClient.set(`attemptCode:${clientId}`, Number(attempt) - 1)
            res.status(500).send(`Error: this code is invalid \n Have ${Number(attempt)-1} more attempts `)
            res.end()
        }
    });

    app.get('/api/v1/revalidate', async(req, res) => {
        let clientId = req.cookies['clientId'];
        console.log('Revalidate Code ', clientId)

        if(blockedValidate) return res.status(500).send('operation blocked by too many attempts, wait 5 minutes and try again')
        const credential = JSON.stringify(await redisClient.hGetAll(`credential:${clientId}`), null, 2)
        if(!JSON.parse(credential).email) return res.status(500).send('Error: action not found')
        createValidateCode()
        const validationCode = await redisClient.get(`validationCode:${clientId}`);
        sendEmailSignUpValidation(JSON.parse(credential).email, validationCode)
        return res.status(200).send('Resend successfully')
    });

    app.post('/api/v1/signin', async(req, res, next) => {
        const {email, password}: signInCredentials = req.body
        if(!email || !password) return res.status(500).send('Bad Request \n email and password is required')
        if(!validateEmail(email)) return res.status(400).send('Bad Request \n email invalid')
        const isExists = await userExists(email)
        if(!isExists) return res.status(400).send('Bad Request \n Account not exisits')
        let attempt = await redisClient.get(`attemptSignIn:${email}`)
        if(!attempt) {
            await redisClient.set(`attemptSignIn:${email}`, 5)
        }
        
        if(Number(attempt) == 0) {
            blockedValidate = true
            setTimeout(() => blockedValidate = false, 60000 * 5)
            return res.status(500).send('operation blocked by too many attempts, wait 5 minutes and try again')
        }
        const login = await handleSignIn({email, password})
        if(login == 200 ) {
            await redisClient.del(`attemptSignIn:${email}`)
            return res.status(200).send('Access Successfully')
        }
        else if(login == 202) return res.status(202).send('Send code to email!!')
        else {
            redisClient.set(`attemptSignIn:${email}`, Number(attempt) - 1)
            return res.status(500).send(`Bad Request \n Login failed \n Have ${Number(attempt)-1} more attempts`)
        }
    })

    app.get('/api/v1/signin/validate/:code', async (req, res) => {
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