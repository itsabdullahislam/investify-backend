import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source'; 
import http from 'http';
import authRoutes from './routes/auth.routes';
import campaignRoutes from './routes/campaign.routes';
import cors from 'cors';
import investorRoutes from './routes/investor.routes';
import path from 'path';
import innovatorRoutes from './routes/innovator.routes';
import Likeroutes from './routes/like.routes'; 
import investmentroutes from './routes/investment.routes'; 
import cookieParser from "cookie-parser";
import { authenticateUser } from './middleware/auth';
import chatRoutes from './routes/chat.routes';
import { initSocket } from './socket/socket';
import searchRoutes from './routes/search.routes';


dotenv.config();

// Define the PORT variable
const PORT = process.env.PORT || 3000;


const app = express();




AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    
    // Middleware to parse JSON bodies
    app.use(express.json());


    const server =  app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
    initSocket(server);

    app.use(cors({
      origin: "https://nice-grass-01a8bd000.6.azurestaticapps.net/", 
      credentials : true
    }));

    
    app.use(cookieParser());
    app.get('/api/me', authenticateUser, (req: express.Request, res: express.Response) => {
      if ((req as any).user) {
        res.status(200).json((req as any).user); // Ensure req.user is properly cast
      } else {
        res.status(401).json({ message: 'Unauthorized' });
      }
    });
    

   app.use(cookieParser());
    // Register routes
    app.use('/api', searchRoutes)
    app.use("/api/chat", chatRoutes);
    app.use('/api/investment', investmentroutes); 
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use('/api', innovatorRoutes);
    app.use('/api', investorRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/campaigns', campaignRoutes);
    app.use('/api', Likeroutes);
    // Start the server
    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
