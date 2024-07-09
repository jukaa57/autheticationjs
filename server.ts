import { Resend } from 'resend';
import express from 'express';
import { Routes } from './routes';
import { redisConnect } from './shared/connections';

export const app = express();
const PORT = 3000

app.listen(PORT, async() => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
})
app.use(express.json()) 

redisConnect()
Routes();