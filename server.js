// Import the necessary modules
import express from 'express';

import { promises as fs } from 'fs';
import dotenv from "dotenv";
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

// Congif to use env variables
dotenv.config();

// Create a new pool instance to manage multiple database connections.
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });

// Create an Express application
const app = express();

// Use middleware to parse JSON bodies, CORS, and run index.html
app.use(express.json());
app.use(cors());
app.use(express.static('public'));







app.post('/user/login', async (req, res) => {
    const userAddress = req.body.account;

    try {
        // Check if the user exists
        const userQuery = 'SELECT * FROM wallets WHERE wallet_address = $1';
        const userResult = await pool.query(userQuery, [userAddress]);
        console.log('userResult: ' + JSON.stringify(userResult.rows[0].id))

        if (userResult.rows.length === 0) {
            // User does not exist, create a new one
            const insertQuery = 'INSERT INTO wallets (wallet_address) VALUES ($1) RETURNING id';
            const insertResult = await pool.query(insertQuery, [userAddress]);
            console.log('insertResult: ' + insertResult)
            // Return the new user data
            return res.json({ success: true, userId: insertResult.rows[0].id, newUser: true });
        } else {
            // User exists, return existing data
            return res.json({ success: true, userId: userResult.rows[0].id, newUser: false });
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});




// READ: Get all users FOR TESTING PURPOSES
app.get('/wallets', async (req, res) => {
    try {
        const allUsers = await pool.query('SELECT * FROM wallets');
        res.status(200).json(allUsers.rows);
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
});








// Handle 404 for any other routes
app.use((req, res) => {
    res.status(404).send('Not Found');
});
  
// Start the server and have it listen on the specified port
app.listen(process.env.PORT, () => {
console.log(`Server running on port ${process.env.PORT}`);
});