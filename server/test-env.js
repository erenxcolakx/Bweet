require('dotenv').config();

console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Database Config:');
console.log('PG_USER:', process.env.PG_USER);
console.log('PG_HOST:', process.env.PG_HOST);
console.log('PG_DATABASE:', process.env.PG_DATABASE);
console.log('PG_PORT:', process.env.PG_PORT);

console.log('\nGoogle OAuth Config:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '****' : undefined);
console.log('BASE_URL:', process.env.BASE_URL); 