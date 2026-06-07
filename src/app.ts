import 'dotenv/config';
import * as Sentry from '@sentry/node';


import express from 'express';
import { Request, Response, NextFunction } from 'express';
import authRouter from './routes/auth';
import recipesRouter from './routes/recipes';
import { errorHandler } from './middleware/errorHandler';
import cors from 'cors';
import helmet from 'helmet'
import rateLimit from 'express-rate-limit';


Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development'
});
const app = express();
const authLimiter = rateLimit({
    windowMs: 15*60*1000,
    limit: process.env.NODE_ENV === 'test' ? 1000 : 5,
    message: "Login limit reached, Please try again after some time"
})
app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') 
    ?? ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authLimiter, authRouter)
app.use('/api/recipes', recipesRouter)

//any other route
app.use((req: Request,res: Response)=>{
    res.status(404).json({error: "Route not exist"})
})

app.use(errorHandler)

export default app;