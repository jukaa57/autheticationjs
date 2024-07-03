import { sigInCredentials } from './interfaces';
import {app} from './server';
import { createSignIn } from './signIn';
import bodyParser from 'body-parser'
import { validateEmail, validatePassword } from './util';

export function Routes() {
    

    app.get('/', (req, res) => {
        res.send('<h1>Welcome!</h1>');
    })

    app.post('/signup', (req, res) => {
        const {username, email, password}: sigInCredentials = req.body
        if(!username || !password || !email) {
            res.status(400).send('Bad Request')
        }
        if(!validateEmail(email)) {
            res.status(400).send('Bad Request \n email invalid')
        }
        if(!validatePassword(password)) {
            res.status(400).send('Bad Request \n Password must be at least')
        }

        res.status(200).send('Account successfully')
        createSignIn({username, email, password})
    })
}