import { Resend } from 'resend';
import express from 'express';
import { Routes } from './routes';

const key_resend = process.env.API_KEY_RESEND
// const resend = new Resend(key_resend);

export const app = express();
const PORT = 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
})
app.use(express.json()) 
Routes()
// async function sendEmail() {
//   try {
//     const data = await resend.emails.send({
//       from: 'Acme <onboarding@resend.dev>',
//       to: ['nostalgiagamebox@gmail.com'],
//       subject: 'Hello World',
//       html: '<strong>It works!</strong>'
//     });
    
//     console.log(data);
//   } catch (error) {
//     console.error(error);
//   }
// };

