import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userManagementRouter from './router/UserManagement/userManagement.js';
import connectDB from './DB/Database.js';
import tokenManagementRoute from './router/TokenManagement/tokenManagementRoute.js';
import errorHandler from './Middlewares/errorHandlingMiddleware.js';
import videoManagementRoute from './router/VideoManagement/videoManagement.js';

const app = express();
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(errorHandler);

// Routes
app.use('/api/v1/userManagement', userManagementRouter);
app.use('/api/v1/tokenManagement', tokenManagementRoute);
app.use('/api/v1/videoManagement', videoManagementRoute);

// Port
app.listen(3003, () => {
    console.log(`Server running on port ${3003}`);
});
