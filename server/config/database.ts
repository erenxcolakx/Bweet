import pg from 'pg';
import env from 'dotenv'
import logger from '../config/logger';
env.config();

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = isProduction
  ? process.env.DATABASE_URL // You'll need to add this to Vercel environment variables
  : `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;

const db = new pg.Client({
  connectionString,
  ssl: isProduction ? {
    rejectUnauthorized: false
  } : false
});

db.connect()
  .then(() => {
    logger.info('Connected to database');
  })
  .catch((error) => {
    logger.error('An error occurred while connecting:', error);
  });

export default db;
