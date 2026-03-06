import express from 'express';
import cors from 'cors';
import logger from './middlewares/logger';
import noteRoutes from './routes/noteRoutes';
import userRoutes from './routes/userRoutes';

const app = express()
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  exposedHeaders: ['X-Total-Count']
};



app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);
app.use('/', userRoutes);
app.use('/notes', noteRoutes);



export default app
