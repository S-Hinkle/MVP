// Import the necessary modules
import express from 'express';
import { promises as fs } from 'fs';
import dotenv from "dotenv";
//import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

// Create a new pool instance to manage multiple database connections.
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });

// Congif to use env variables
dotenv.config();
// Create an Express application
const app = express();
// Use middleware to parse JSON bodies, CORS, and run index.html
app.use(express.json());
//app.use(cors());
app.use(express.static('public'));













// Handle 404 for any other routes
app.use((req, res) => {
    res.status(404).send('Not Found');
});
  
// Start the server and have it listen on the specified port
app.listen(process.env.PORT, () => {
console.log(`Server running on port ${process.env.PORT}`);
});