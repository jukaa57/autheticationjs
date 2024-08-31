import express from 'express';
import cookieParser from 'cookie-parser';
import { Routes } from './routes';
import { redisConnect } from './shared/connections';

export const app = express();
const PORT = 3000

redisConnect()
app.use(express.json()) 
app.use(cookieParser())

Routes(app);
app.listen(PORT, async() => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
})