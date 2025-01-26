import { createClient } from '@supabase/supabase-js';
import env from 'dotenv';
import logger from '../config/logger';

// Load environment variables from .env file
env.config();

const isProduction = process.env.NODE_ENV === 'production';
logger.info(`Environment: ${process.env.NODE_ENV}`);

const supabaseUrl = 'https://bdbvtpsbgrxgieyvnvig.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY is not defined in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
async function testConnection() {
  try {
    const { count } = await supabase.from('books').select('*', { count: 'exact', head: true });
    logger.info('Connected to Supabase database');
    logger.info(`Found ${count} books in the database`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('An error occurred while connecting to Supabase:', error.message);
    } else {
      logger.error('An unknown error occurred while connecting to Supabase');
    }
  }
}

// Run the test
testConnection();

export default supabase;
