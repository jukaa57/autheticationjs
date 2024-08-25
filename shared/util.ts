import ejs from 'ejs'
import path from 'path';
import { Resend } from 'resend';
import { redisClient } from "./connections";

const key_resend = process.env.API_KEY_RESEND
const resend = new Resend(key_resend);

export function validatePassword(password: string) {
    if (password.length < 8) return {pass: false, error: "Password must be at least min 8 characters"};
    
    const numStr =  /\d/ 
    if(!numStr.test(password)) return {pass: false, error: "Password not contains number"};

    const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if(!format.test(password)) return {pass: false, error: "Password not contains special characters"};
    return {pass: true};
}

export function validateEmail(email: string) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

export async function createValidateCode() {
    const validationCode = Math.floor(100000 + Math.random() * 900000); // Gera um código de validação de 6 dígitos
    redisClient.set('validationCode', validationCode);
    console.log(validationCode)
    cleanValidateCode()
}

export async function cleanValidateCode() {
    let timer = setTimeout(() => {
      redisClient.del('validationCode')
    }, 60 * 1000) // 60 seconds
    return timer
}

export function sendEmailSignUpValidation(email: string, validationCode: string | null): number {
    let responseEmail: number = 202

    ejs.renderFile(path.join(__dirname, '../views', 'welcome.ejs'), { validationCode: validationCode }, (err: any, html: any) => {
        if (err || !validationCode) {
            console.log(err);
            responseEmail = 500
        }
        (async function sendEmail() {
          try {
            const data = await resend.emails.send({
              from: 'Acme <onboarding@resend.dev>',
              to: [email],
              subject: 'Hello World',
              html: html
            });
            // console.log(data);
          } catch (error) {
            console.error(error);
            return
          }
        })();
    });
    return responseEmail
}

export const now = new Date().toDateString();