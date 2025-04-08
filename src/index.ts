import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source'; // Import AppDataSource
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();


AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    
    // Middleware to parse JSON bodies
    app.use(express.json());
    
    // Register routes
    app.use('/api/auth', authRoutes);

    // Start the server
    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
