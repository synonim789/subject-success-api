import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import createHttpError from 'http-errors';
import morgan from 'morgan';
import { corsOptions } from './config/corsOptions';
import errorMiddleware from './middleware/errorMiddleware';
import authRoutes from './routes/authRoutes';
import subjectRoutes from './routes/subjectRoutes';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/subject', subjectRoutes);
app.use('/task', taskRoutes);

app.use((req, res, next) => {
   next(createHttpError(404, 'Endpoint not found'));
});

app.use(errorMiddleware);

export default app;
