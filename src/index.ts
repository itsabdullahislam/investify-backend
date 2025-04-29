import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source'; // Import AppDataSource
import authRoutes from './routes/auth.routes';
import campaignRoutes from './routes/campaign.routes';
import cors from 'cors';
import investorRoutes from './routes/investor.routes';
import path from 'path';

dotenv.config();

const app = express();


AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    
    // Middleware to parse JSON bodies
    app.use(express.json());

    app.use(cors({
      origin: 'http://localhost:3001', // frontend URL
      credentials: true,
    }));
    
    // Register routes
    
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use('/api', investorRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/campaigns', campaignRoutes);
    // Start the server
    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
