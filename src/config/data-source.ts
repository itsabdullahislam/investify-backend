import { DataSource } from 'typeorm';
import { User } from '../entities/user';
import { Campaign } from '../entities/campaign.entity';

export const AppDataSource = new DataSource({
  type: 'postgres', // Use PostgreSQL as the database type
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT!) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'fast4896',
  database: process.env.DB_NAME || 'investify',
  synchronize: true, // Automatically create the database schema (use cautiously in production)
  logging: true,
  entities: [User, Campaign], // Add more entities here later
  migrations: [],
  subscribers: [],
});

