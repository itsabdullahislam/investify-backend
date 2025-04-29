import { DataSource } from 'typeorm';
import { User } from '../entities/user';
import { Campaign } from '../entities/campaign.entity';
import { Innovator } from '../entities/innovator.entity';
import { Investment } from '../entities/investment';
import { Investor } from '../entities/investor.entity';

export const AppDataSource = new DataSource({
  type: 'postgres', 
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT!) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'fast4896',
  database: process.env.DB_NAME || 'investify',
  synchronize: true, 
  logging: true,
  entities: [User, Campaign , Investor , Innovator , Investment], 
  migrations: [],
  subscribers: [],
});

