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

// // Create a new pool instance to manage multiple database connections.
// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASS,
//     port: process.env.DB_PORT,
//   });

  // Create a new pool instance to manage multiple database connections.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

// Create an Express application
const app = express();


// Flag to check if Moralis has been started
let isMoralisStarted = false;

async function startMoralis() {
    if (!isMoralisStarted) {
        await Moralis.start({
            apiKey: process.env.MORALIS_API_KEY
        });
        isMoralisStarted = true;
    }
}


// Use middleware to parse JSON bodies, CORS, and run index.html
app.use(express.json());
app.use(cors());
app.use(express.static('public'));







// ==================== MetaMask Authentication ====================  //

app.post('/user/login', async (req, res) => {
    const userAddress = req.body.account;

    try {
        // Check if the user exists
        const userQuery = 'SELECT * FROM wallets WHERE wallet_address = $1';
        const userResult = await pool.query(userQuery, [userAddress]);
        //console.log('userResult: ' + JSON.stringify(userResult.rows[0].id)) // TROUBLESHOOTING REMOVE LATER

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









app.post('/api/user-coins', async (req, res) => {
    const { wallet_address } = req.body;

    //console.log(wallet_address)
    try {
        const result = await pool.query(
            'SELECT c.coin_name FROM coins c INNER JOIN wallets w ON c.wallet_id = w.id WHERE w.wallet_address = $1',
            [wallet_address]
        );
        //console.log(result);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/api/add-coin', async (req, res) => {
    const { wallet_address, coin_name } = req.body;

    try {
        // First, ensure the wallet exists or create it
        const walletRes = await pool.query(
            'INSERT INTO wallets (wallet_address) VALUES ($1) ON CONFLICT (wallet_address) DO NOTHING RETURNING id',
            [wallet_address]
        );

        let walletId = walletRes.rows[0]?.id;
        if (!walletId) {
            // Fetch the existing wallet ID
            const existingWallet = await pool.query(
                'SELECT id FROM wallets WHERE wallet_address = $1',
                [wallet_address]
            );
            walletId = existingWallet.rows[0].id;
        }

        // Add the coin to the coins table
        await pool.query(
            'INSERT INTO coins (coin_name, wallet_id) VALUES ($1, $2)',
            [coin_name, walletId]
        );

        res.status(201).send('Coin added successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/api/remove-coin', async (req, res) => {
    const { wallet_address, coin_name } = req.body;

    try {
        // Get wallet ID
        const walletRes = await pool.query(
            'SELECT id FROM wallets WHERE wallet_address = $1',
            [wallet_address]
        );
        const walletId = walletRes.rows[0]?.id;

        if (!walletId) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        // Remove the coin from the coins table
        await pool.query(
            'DELETE FROM coins WHERE coin_name = $1 AND wallet_id = $2',
            [coin_name, walletId]
        );

        res.status(200).send('Coin removed successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});







app.post('/api/fetch-coin-data', async (req, res) => {
    const { coin_name } = req.body;

    //console.log(coin_name)
    try {
        // const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin_name.toLowerCase()}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true`);
        // if (!response.ok) {
        //     throw new Error(`HTTP error! Status: ${response.status}`);
        // }
        // const coinData = await response.json();



        const url = `https://api.coingecko.com/api/v3/coins/${coin_name.toLowerCase()}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true&x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;
        const coingeckoResponse = await fetch(url);
        
        if (!coingeckoResponse.ok) {
            throw new Error(`HTTP error! Status: ${coingeckoResponse.status}`);
        }

        //  const coinData  = await coingeckoResponse.json();
        //  res.json(coinData);


        const fullData = await coingeckoResponse.json();
        // Extract only the necessary fields
        const filteredData = {
            image: fullData.image.large,
            id: fullData.id,
            homepage: fullData.links.homepage[0],
            blockchain_site: fullData.links.blockchain_site[0],
            genesis_date: fullData.genesis_date,
            sentiment_votes_down_percentage: fullData.sentiment_votes_down_percentage,
            sentiment_votes_up_percentage: fullData.sentiment_votes_up_percentage,
            commit_count_4_weeks: fullData.developer_data.commit_count_4_weeks,
            market_cap_rank: fullData.market_cap_rank,
            current_price: fullData.market_data.current_price.usd,
            market_cap: fullData.market_data.market_cap.usd,
            total_volume: fullData.market_data.total_volume.usd,
            price_change_percentage_1h: fullData.market_data.price_change_percentage_1h_in_currency.usd,
            price_change_percentage_24h: fullData.market_data.price_change_percentage_24h_in_currency.usd,
            price_change_percentage_7d: fullData.market_data.price_change_percentage_7d_in_currency.usd,
            ath: fullData.market_data.ath.usd,
            ath_date: fullData.market_data.ath_date.usd,
            twitter_followers: fullData.community_data.twitter_followers,
            description: fullData.description.en,
            sparkline_7d: fullData.market_data.sparkline_7d
        };

        res.json(filteredData);
    } catch (error) {
        console.error(`Error fetching data for ${coin_name}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





















// ==================== Data For Market Page ====================  //

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



// Route to fetch top coin data from CoinGecko
app.get('/api/getNativeprice', async (req, res) => {
    try {
        const url = `https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;
        const coingeckoResponse = await fetch(url);
        
        if (!coingeckoResponse.ok) {
            throw new Error(`HTTP error! Status: ${coingeckoResponse.status}`);
        }

        const fullDataFromAPI  = await coingeckoResponse.json();

        // // Transform the data for each coin
        // const transformedData = fullDataFromAPI.map(coin => ({
        //     market_cap_rank: coin.market_data.current_price.usd
        // }));

        // //console.log(transformedData)


        res.status(200).json(fullDataFromAPI);
    } catch (error) {
        console.error('Error fetching market data from CoinGecko:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/api/getNativeBalance', async (req, res) => {
    const { chain, address } = req.body;

    try {
        await startMoralis(); // This ensures Moralis is started only once
        //await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

        const response = await Moralis.EvmApi.balance.getNativeBalance({ chain, address });
        //console.log(response.raw);
        res.json(response.raw);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/api/getWalletTokenBalances', async (req, res) => {
    const { chain, address } = req.body;

    try {
        await startMoralis(); // This ensures Moralis is started only once
        //await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

        const response = await Moralis.EvmApi.token.getWalletTokenBalances({ chain, address });
        //console.log(response.raw);
        res.json(response.raw);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.post('/api/getTokenPrice', async (req, res) => {
    const { chain, address } = req.body;

    try {
        await startMoralis(); // This ensures Moralis is started only once
        //await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

        const response = await Moralis.EvmApi.token.getTokenPrice({ chain, address });
        //console.log(response.raw);
        res.json(response.raw);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/api/getWalletNFTs', async (req, res) => {
    const { address } = req.body;

    try {
        await startMoralis(); // This ensures Moralis is started only once

        const response = await Moralis.EvmApi.nft.getWalletNFTs({
            chain: "0x1",
            format: "decimal",
            normalizeMetadata: true,
            excludeSpam: true,
            mediaItems: true,
            address: address
        });

        res.json(response.raw);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});








// ==================== Testing Database ====================  //


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