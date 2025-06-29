
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';

const { Pool } = pkg;

// Setup .env path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create the pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false, // required for Aiven or similar hosted DBs
  }
});

console.log('ENV:', {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
});

// Connect and create tables
pool.connect()
  .then(async (client) => {
    console.log("✅ Connected to PostgreSQL");

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        password VARCHAR(200) NOT NULL,
        role VARCHAR(20) NOT NULL
      );
    `);

    // Restaurants
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        restaurant_name VARCHAR(100) NOT NULL,
        url TEXT,
        timing VARCHAR(100),
        address TEXT,
        location VARCHAR(100),
        city VARCHAR(100),
        offer TEXT,
        contact_number VARCHAR(20),
        restaurant_type VARCHAR(50),
        ratings_for_swiggy DECIMAL
      );
    `);

    // Restaurant menu items
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurant_menu_items (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        item_name VARCHAR(100),
        image_url TEXT,
        description TEXT,
        price DECIMAL,
        rating DECIMAL
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        item_id INTEGER,
        item_name VARCHAR(255),
        restaurant_name VARCHAR(255),
        quantity INTEGER NOT NULL DEFAULT 1,
        item_total NUMERIC(10, 2) NOT NULL,
        delivery_fee NUMERIC(10, 2) NOT NULL,
        gst NUMERIC(10, 2) NOT NULL,
        total_paid NUMERIC(10, 2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ All tables are ready");
    client.release();
  })
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));

// Export pool (ES module export)
export default pool;

