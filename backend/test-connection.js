// Quick test to see what's failing
require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing PostgreSQL connection...');
console.log('DB Config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER
});

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'q4life_allegro',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Database connected successfully!');
    console.log('Current time:', res.rows[0].now);
    pool.end();
});
