-- Create wallets table
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    wallet_address CHAR(42) NOT NULL UNIQUE
);

-- Create coins table
CREATE TABLE coins (
    id SERIAL PRIMARY KEY,
    coin_name VARCHAR(255) NOT NULL,
    wallet_id INT NOT NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);

-- Create an index on the wallet_address for faster searches
CREATE INDEX idx_wallet_address ON wallets(wallet_address);
