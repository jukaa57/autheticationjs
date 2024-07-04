import { sigUpCredentials } from './shared/interfaces';
import {app} from './server';
import { createSignUp } from './signUp';
import bodyParser from 'body-parser'
import { validateEmail, validatePassword } from './shared/util';
import { userExists } from './actions';
import ejs from 'ejs'
import path from 'path';
import { Resend } from 'resend';

const key_resend = process.env.API_KEY_RESEND
const resend = new Resend(key_resend);
export function Routes() {
    
    app.get('/', (req, res) => {
        res.send('<h1>Welcome!</h1>');
    })

    app.post('/signup', async (req, res) => {
        const {username, email, password}: sigUpCredentials = req.body
        if(!username || !password || !email) {
            return res.status(400).send('Bad Request')
        }
        if(!validateEmail(email)) {
            return res.status(400).send('Bad Request \n email invalid')
        }

        const isExists = await userExists(email)
        if(isExists) {
            return res.status(400).send('Bad Request \n Email already exists')
        }
        if(!validatePassword(password)) {
            return res.status(400).send('Bad Request \n Password must be at least \n Need min 8 characters with numbers and special characters')
        }
        const validationCode = Math.floor(100000 + Math.random() * 900000); // Gera um código de validação de 6 dígitos


        // ejs.renderFile(path.join(__dirname, 'views', 'welcome.ejs'), { validationCode: validationCode.toString() }, (err: any, html: any) => {
        //     if (err) {
        //         console.log(err);
        //         return res.status(500).send('Erro ao renderizar template');
        //     }
        //    ( async function sendEmail() {
        //       try {
        //         const data = await resend.emails.send({
        //           from: 'Acme <onboarding@resend.dev>',
        //           to: [email],
        //           subject: 'Hello World',
        //           html: html
        //         });
                
        //         console.log(data);
        //       } catch (error) {
        //         console.error(error);
        //       }
        //     })();
        // });
    
        
        // createSignUp({username, email, password})
        return res.status(200).send('Account successfully')
    })
}