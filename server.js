// Import the necessary modules
import express from 'express';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';
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
        console.log('userResult: ' + JSON.stringify(userResult.rows[0].id)) // TROUBLESHOOTING REMOVE LATER

        if (userResult.rows.length === 0) {
            // User does not exist, create a new one
            const insertQuery = 'INSERT INTO wallets (wallet_address) VALUES ($1) RETURNING id';
            const insertResult = await pool.query(insertQuery, [userAddress]);
            console.log('insertResult: ' + insertResult) // TROUBLESHOOTING REMOVE LATER
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





// Route to fetch market data from CoinGecko
app.get('/api/market-data', async (req, res) => {
    try {
        const url = `https://api.coingecko.com/api/v3/global?x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;
        const coingeckoResponse = await fetch(url);
        
        if (!coingeckoResponse.ok) {
            throw new Error(`HTTP error! Status: ${coingeckoResponse.status}`);
        }

        const data = await coingeckoResponse.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching market data from CoinGecko:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Route to fetch top coin data from CoinGecko
app.get('/api/top-coins', async (req, res) => {
    try {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d%2C30d&locale=en&x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;
        const coingeckoResponse = await fetch(url);
        
        if (!coingeckoResponse.ok) {
            throw new Error(`HTTP error! Status: ${coingeckoResponse.status}`);
        }

        const fullDataFromAPI  = await coingeckoResponse.json();

        // Transform the data for each coin
        const transformedData = fullDataFromAPI.map(coin => ({
            market_cap_rank: coin.market_cap_rank,
            image: coin.image,
            id: coin.id,
            current_price: coin.current_price,
            price_change_percentage_24h_in_currency: coin.price_change_percentage_24h_in_currency,
            price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
            market_cap: coin.market_cap,
            total_volume: coin.total_volume
        }));

        //console.log(transformedData)


        res.status(200).json(transformedData);
    } catch (error) {
        console.error('Error fetching market data from CoinGecko:', error);
        res.status(500).json({ error: 'Internal server error' });
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