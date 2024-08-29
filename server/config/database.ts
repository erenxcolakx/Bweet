import pg from 'pg';
import env from 'dotenv'
env.config();

const requiredEnvVariables = ['PG_USER', 'PG_HOST', 'PG_DATABASE', 'PG_PASSWORD', 'PG_PORT'] as const;

const missingEnvVariables = requiredEnvVariables.filter((variable) => !process.env[variable]);

if (missingEnvVariables.length > 0) {
  throw new Error(`Missing environment variables: ${missingEnvVariables.join(', ')}`);
}

const db = new pg.Client({
  user: process.env.PG_USER as string,
  host: process.env.PG_HOST as string,
  database: process.env.PG_DATABASE as string,
  password: process.env.PG_PASSWORD as string,
  port: parseInt(process.env.PG_PORT as string, 10),
});


db.connect()
  .then(() => {
    console.log('Connected to database');
  })
  .catch((error) => {
    console.error('An error occurred while connecting:', error);
  });

export default db;
