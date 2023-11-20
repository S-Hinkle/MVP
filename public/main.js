let connectedEthAddress = null; // Global variable to store the connected address





// =========================== Section for loading market data =========================== //


function loadMarketContent() {
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = `
        <div class="market-container">
            <div class="box-row">
                <!-- Column 1 -->
                <div class="column">
                    <div class="box" id="marketCap"></div>
                    <div class="box" id="marketVolume"></div>
                </div>

                <!-- Column 2 -->
                <div class="column">
                    <div class="box" id="marketPercentChange"></div>
                    <div class="box" id="ongoingICOs"></div>
                </div>

                <!-- Column 3 -->
                <div class="column">
                    <div class="box" id="coins"></div>
                    <div class="box" id="markets"></div>
                </div>

                <!-- Canvas Column -->
                <div class="column">
                    <canvas class="box" id="marketCapChart"></canvas>
                </div>
            </div>
            <div class="large-box">
                <div id="coinTableContainer"></div>
            </div>
        </div>
    `;
    getMarketData();
}


async function getMarketData() {

    try {
        const responseMarketData = await fetch('/api/market-data');
        if (!responseMarketData.ok) {
            throw new Error(`HTTP error! Status: ${responseMarketData.status}`);
        }
        const dataMarket = await responseMarketData.json();
        //console.log(dataMarket); // TROUBLESHOOTING REMOVE LATER


        const responseTopCoins = await fetch('/api/top-coins');
        if (!responseTopCoins.ok) {
            throw new Error(`HTTP error! Status: ${responseTopCoins.status}`);
        }
        const dataTopCoins = await responseTopCoins.json();
        //console.log('response after json',dataTopCoins); // TROUBLESHOOTING REMOVE LATER



        addMarketData(dataMarket);
        addTopCoinData(dataTopCoins);
    } catch (error) {
        console.error('Error fetching market data:', error);
    }
}



function addMarketData(data) {
    const marketCap = document.querySelector("#marketCap");
    const marketVolume = document.querySelector("#marketVolume");
    const marketPercentChange = document.querySelector("#marketPercentChange");
    const ongoingICOs = document.querySelector("#ongoingICOs");
    const coins = document.querySelector("#coins");
    const markets = document.querySelector("#markets");


    marketCap.innerHTML = `Market Cap<br><br> $${data.data.total_market_cap.usd.toLocaleString()}`;
    marketVolume.innerHTML = `24h Volume<br><br> $${data.data.total_volume.usd.toLocaleString()}`;
    marketPercentChange.innerHTML = `Market Cap 24h Change<br><br> ${data.data.market_cap_change_percentage_24h_usd}%`;
    ongoingICOs.innerHTML = `Ongoing ICOs<br><br> ${data.data.ongoing_icos}`;
    coins.innerHTML = `Total CryptoCurrencies<br><br> ${data.data.active_cryptocurrencies}`;
    markets.innerHTML = `Total Markets<br><br> ${data.data.markets}`;
    

    createMarketCapBreakdownChart(data.data.market_cap_percentage);
}



function createMarketCapBreakdownChart(dataObject) {
    const myCanvas = document.getElementById("marketCapChart");
    //console.log('Test canvas:', myCanvas); // TROUBLESHOOTING REMOVE LATER
    const ctx = myCanvas.getContext("2d");


    const labels = Object.keys(dataObject);
    const dataPoints = Object.values(dataObject);
    //console.log(labels); // TROUBLESHOOTING REMOVE LATER
    //console.log(dataPoints); // TROUBLESHOOTING REMOVE LATER

    const myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Market Cap Percentage',
                data: dataPoints,
                backgroundColor: [
                    // You can specify different colors for each segment here
                    '#8071DD', // BTC (Bitcoin)
                    '#323540', // ETH (Ethereum)
                    '#F4F3F6', // USDT (Tether)
                    '#242631', // BNB (Binance Coin)
                    '#F8F8F8', // XRP (Ripple)
                    '#8071DD', // SOL (Solana)
                    '#323540', // USDC (USD Coin)
                    '#F4F3F6', // STETH (Lido Staked Ether)
                    '#242631', // ADA (Cardano)
                    '#F8F8F8'  // DOGE (Dogecoin)
                ],
                borderColor: [
                    // Border colors for each segment
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Market Cap Breakdown'
                }
            }
        }
    });
}



function addTopCoinData(dataTopCoins) {


    // Create table and table header
    const table = document.createElement('table');
    table.innerHTML = `
        <tr>
            <th>Rank</th>
            <th>Symbol</th>
            <th>Coin</th>
            <th>Price</th>
            <th>24h</th>
            <th>7D</th>
            <th>Market Cap</th>
            <th>24h Volume</th>
        </tr>
    `;

    // Populate table rows with coin data
    dataTopCoins.forEach(coin => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${coin.market_cap_rank}</td>
            <td><img src="${coin.image}" alt="${coin.id}" style="width: 30px; height: 30px;"></td>
            <td>${coin.id}</td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td>${coin.price_change_percentage_24h_in_currency.toFixed(2)}%</td>
            <td>${coin.price_change_percentage_7d_in_currency.toFixed(2)}%</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
            <td>$${coin.total_volume.toLocaleString()}</td>
        `;
    });

    // Append the table to the container
    const container = document.getElementById('coinTableContainer');
    container.innerHTML = ''; // Clear any existing content
    container.appendChild(table);

}








// =========================== Section for user portfolio data =========================== //


async function portolioData() {
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = `
        <div class="portfolio-container">
            <div class="portfolio-box" id="address">Wallet Analytics For Address: ${connectedEthAddress}</div>
            <div class="portfolio-box" id="token-balance">Token Balances</div>
            <div class="portfolio-box" id="nfts"></div>
            <div class="portfolio-box" id="transactions"></div>
        </div>
    `;

    const ethBalance = await getNativeBalance("0x1", connectedEthAddress);
    //console.log(ethBalance);

    const ethData = await getNativeprice();
    const ethPrice = ethData.market_data.current_price.usd

    const ethBalanceWithChain = [
        {
            "token_address": null,
            "symbol": "eth",
            "name": "Ethereum",
            "logo": null,
            "thumbnail": null,
            "decimals": 18,
            "balance": ethBalance.balance,
            "possible_spam": false,
            "chain": "0x1",
            "usdPrice": ethPrice
        }
    ]




    const testWallet = "0x98b24E6B52109C70A83783DCB3B6825BA6dEcF3C"

    const erc20Balance = await getWalletTokenBalances("0x1", connectedEthAddress);
    const avaxBalance = await getWalletTokenBalances("0xa86a", connectedEthAddress);
    const bscBalance = await getWalletTokenBalances("0x38", connectedEthAddress);
    const polyBalance = await getWalletTokenBalances("0x89", connectedEthAddress);
    const fantomBalance = await getWalletTokenBalances("0xfa", connectedEthAddress);

    const erc20BalanceWithChain = erc20Balance.map(token => ({ ...token, chain: "0x1" }));
    const avaxBalanceWithChain = avaxBalance.map(token => ({ ...token, chain: "0xa86a" }));
    const bscBalanceWithChain = bscBalance.map(token => ({ ...token, chain: "0x38" }));
    const polyBalanceWithChain = polyBalance.map(token => ({ ...token, chain: "0x89" }));
    const fantomBalanceWithChain = fantomBalance.map(token => ({ ...token, chain: "0xfa" }));

    //console.log(erc20BalanceWithChain);

    // Combine balances from all blockchains
    const allBalances = [
        ...erc20BalanceWithChain,
        ...avaxBalanceWithChain,
        ...bscBalanceWithChain,
        ...polyBalanceWithChain,
        ...fantomBalanceWithChain
    ].filter(token => token && token.balance !== "0" && token.possible_spam === false);

    //console.log(allBalances);

    // Fetch USD prices and add to the token data
    const tokenDataWithPrices = await Promise.all(allBalances.map(async token => {
        const chain = token.chain;
        const address = token.token_address;
        try {
            const priceResponse = await fetch('/api/getTokenPrice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chain, address}),
            });

            if (!priceResponse.ok) {
                throw new Error(`HTTP error! Status: ${priceResponse.status}`);
            }

            const priceData = await priceResponse.json();
            return {
                ...token,
                usdPrice: priceData.usdPrice
            };
        } catch (error) {
            console.error('Error fetching token price:', error);
            return token; // Return token without price in case of error
        }
    }));

    // Create and display the table
    createTokenBalanceTable(tokenDataWithPrices, ethBalanceWithChain);



    const walletNFTs = await getWalletNFTs(testWallet);
    //console.log(walletNFTs)


    // Extract only the necessary data from each NFT and filter out NFTs without a mediaUrl
    const filteredNFTs = walletNFTs.result
    .filter(nft => nft.media && nft.media.media_collection && nft.media.media_collection.medium)
    .map(nft => ({
        name: nft.normalized_metadata ? nft.normalized_metadata.name : null,
        collection: nft.name,
        tokenAddress: nft.token_address,
        tokenId: nft.token_id,
        mediaUrl: nft.media.media_collection.medium
    }));


    createNFTDisplayCards(filteredNFTs);
    //console.log(filteredNFTs);

}




function createTokenBalanceTable(tokenDataWithPrices, ethBalanceWithChain) {
    
    const tokenData = [
        ...ethBalanceWithChain,
        ...tokenDataWithPrices
    ]
    
    const tableContainer = document.getElementById('token-balance');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = '<tr><th>Name</th><th>Balance</th><th>USD Value</th></tr>';

    tokenData.forEach(token => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${token.name}</td>
            <td>${token.balance / Math.pow(10, token.decimals).toFixed(2)}</td>
            <td>${token.usdPrice ? `$${((token.balance / Math.pow(10, token.decimals)) * token.usdPrice).toFixed(2)}` : 'N/A'}</td>
        `;
    });

    tableContainer.appendChild(table);
}



function createNFTDisplayCards(filteredNFTs) {
    const nftsContainer = document.getElementById('nfts');
    filteredNFTs.forEach(nft => {
        const card = document.createElement('div');
        card.className = 'nft-card';

        const nftImage = document.createElement('img');
        nftImage.src = nft.mediaUrl.url;
        card.appendChild(nftImage);

        const nameLink = document.createElement('a');
        nameLink.href = `https://opensea.io/assets/ethereum/${nft.tokenAddress}/${nft.tokenId}`;
        nameLink.target = '_blank';
        nameLink.textContent = nft.name;
        card.appendChild(nameLink);

        const tokenAddress = document.createElement('div');
        tokenAddress.className = 'nft-card-details';
        tokenAddress.textContent = nft.collection;
        card.appendChild(tokenAddress);


        nftsContainer.appendChild(card);
    });
}



async function getNativeBalance(chain, address) {
    try {
        const response = await fetch('/api/getNativeBalance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chain, address }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching wallet token balances:', error);
    }
}



async function getNativeprice() {
    try {
        const responseethPrice = await fetch('/api/getNativeprice');
        if (!responseethPrice.ok) {
            throw new Error(`HTTP error! Status: ${responseethPrice.status}`);
        }
        const ethPriceData = await responseethPrice.json();

        return ethPriceData;
    } catch (error) {
        console.error('Error fetching market data:', error);
    }
}




async function getWalletTokenBalances(chain, address) {
    try {
        const response = await fetch('/api/getWalletTokenBalances', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chain, address }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching wallet token balances:', error);
    }
}


async function getWalletNFTs(address) {
    try {
        const response = await fetch('/api/getWalletNFTs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching wallet token balances:', error);
    }
}














// =========================== Section for User Specific Coins =========================== //



async function coinScreenerData() {
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = `
        <div class="coin-screener-container">
            <div class="coin-instruction">Enter the name of a coin to add it to your coin screener<br>If coin is more than one word seperate with "-"<br>Example: bitcoin-cash</div>
            <div class="coin-screen-box" id="input">
                <input type="text" id="coinNameInput" placeholder="Enter coin name" />
                <button onclick="addCoin()">Add</button>
                <input type="text" id="coinNameRemoveInput" placeholder="Enter coin name to remove" />
                <button onclick="removeCoin()">Remove</button>
            </div>
            <div class="coin-screen-data-box" id="coin-data"></div>
        </div>
    `;

    await fetchUserCoins();
}


async function fetchUserCoins() {
    try {
        const response = await fetch('/api/user-coins', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wallet_address: connectedEthAddress }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const coins = await response.json();
        displayUserCoins(coins);
    } catch (error) {
        console.error('Error fetching user coins:', error);
    }
}


async function displayUserCoins(coins) {
    const coinDataContainer = document.getElementById('coin-data');
    coinDataContainer.innerHTML = ``;

    for (const coin of coins) {
        try {
            const backendResponse = await fetch('/api/fetch-coin-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ coin_name: coin.coin_name }),
            });

            if (!backendResponse.ok) {
                throw new Error(`HTTP error! Status: ${backendResponse.status}`);
            }
            const coinData = await backendResponse.json();
            console.log(coinData);

            // Create the detailed display for each coin
            createCoinDetailElement(coinData, coinDataContainer);
        } catch (error) {
            console.error(`Error fetching data for ${coin.coin_name}:`, error);
            const errorElement = document.createElement('div');
            errorElement.textContent = `Error fetching data for ${coin.coin_name}`;
            coinDataContainer.appendChild(errorElement);
        }
    }
}


function createCoinDetailElement(coinData, container) {
    // Main container for coin details
    const coinDetailDiv = document.createElement('div');
    coinDetailDiv.className = 'coin-detail';
    const topSectionsDiv = document.createElement('div');
    topSectionsDiv.className = 'top-sections';

    // Coin Data Section
    const coinInfoDiv = document.createElement('div');
    coinInfoDiv.className = 'coin-info';
    coinInfoDiv.innerHTML = `
        <h2>Coin Data</h2>
        <img src="${coinData.image}" alt="${coinData.id}" class="coin-image" />
        <div>${coinData.id}</div>
        <a href="${coinData.homepage}" target="_blank">Homepage</a><br>
        <a href="${coinData.blockchain_site}" target="_blank">Block Explorer</a>
    `;
    topSectionsDiv.appendChild(coinInfoDiv);

    // Community and Developer Data Section
    const communityDevDiv = document.createElement('div');
    communityDevDiv.className = 'community-dev-info';
    communityDevDiv.innerHTML = `
        <h2>Community and Developer Data</h2>
        <div>4 Week Commit Count: ${coinData.commit_count_4_weeks}</div>
        <div>Twitter Followers: ${coinData.twitter_followers}</div>
        <div>Positive Sentiment %: ${coinData.sentiment_votes_up_percentage}</div>
        <div>Negative Sentiment %: ${coinData.sentiment_votes_down_percentage}</div>
    `;
    topSectionsDiv.appendChild(communityDevDiv);

    coinDetailDiv.appendChild(topSectionsDiv);

    // Market Data Table
    const MarketTableDiv = document.createElement('div');
    MarketTableDiv.className = 'market-table-div';
    const marketDataTable = document.createElement('table');
    marketDataTable.className = 'coin-market-data';
    marketDataTable.innerHTML = `
        <tr>
            <th>Market Rank</th>
            <th>Price</th>
            <th>% 1h</th>
            <th>% 24hr</th>
            <th>% 7d</th>
            <th>24hr Volume</th>
            <th>Market Cap</th>
        </tr>
        <tr>
            <td>${coinData.market_cap_rank}</td>
            <td>$${coinData.current_price.toLocaleString()}</td>
            <td>${coinData.price_change_percentage_1h}%</td>
            <td>${coinData.price_change_percentage_24h}%</td>
            <td>${coinData.price_change_percentage_7d}%</td>
            <td>$${coinData.total_volume.toLocaleString()}</td>
            <td>$${coinData.market_cap.toLocaleString()}</td>
        </tr>
    `;
    MarketTableDiv.appendChild(marketDataTable);
    coinDetailDiv.appendChild(MarketTableDiv);

    // Description Section
    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'coin-description';
    descriptionDiv.innerHTML = `
        <h2>Description</h2>
        <p>${coinData.description}</p>
    `;
    coinDetailDiv.appendChild(descriptionDiv);

    // Append the detailed div to the container
    container.appendChild(coinDetailDiv);
}




async function addCoin() {
    const coinName = document.getElementById('coinNameInput').value;
    if (!coinName) {
        alert('Please enter a coin name.');
        return;
    }

    try {
        const response = await fetch('/api/add-coin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wallet_address: connectedEthAddress, coin_name: coinName }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        await fetchUserCoins(); // Refresh the coin list
    } catch (error) {
        console.error('Error adding coin:', error);
    }
}


async function removeCoin() {
    const coinName = document.getElementById('coinNameRemoveInput').value;
    if (!coinName) {
        alert('Please enter a coin name to remove.');
        return;
    }

    try {
        const response = await fetch('/api/remove-coin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wallet_address: connectedEthAddress, coin_name: coinName }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        await fetchUserCoins(); // Refresh the coin list
    } catch (error) {
        console.error('Error removing coin:', error);
    }
}


// =========================== Listeners to handle page generation =========================== //

// Add click event listoners to navbar links
document.querySelectorAll('.navbar-links a').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const page = this.textContent.trim();
        loadContent(page);
    });
});


// Decide which page needs to load according to navbar link
function loadContent(page) {
    const contentContainer = document.getElementById('content-container');
    switch (page) {
        case 'Portfolio':
            //contentContainer.innerHTML = '<p>Portfolio content goes here.</p>';
            connectedEthAddress ? portolioData() : displayConnectMessage();
            break;
        case 'Coin Screener':
            //contentContainer.innerHTML = '<p>Coin Screener content goes here.</p>';
            connectedEthAddress ? coinScreenerData() : displayConnectMessage();
            break;
        case 'Market':
            loadMarketContent();
            break;
        case 'Wallet Analysis':
            contentContainer.innerHTML = '<p>Wallet Analysis content goes here.</p>';
            break;
    }
}



// =========================== Listeners to handle MetaMask Login Functionality =========================== //

// Click event to initiate MetaMask connection
document.querySelector(".metamask-connect").addEventListener("click", login);


// Function to connect to MetaMask and add or retrieve the user to the database
async function login() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            //console.log(accounts); // TROUBLESHOOTING REMOVE LATER

            if (accounts.length > 0) {
                connectedEthAddress = accounts[0]; // Store the connected address
                const welcomeUser = document.querySelector('.welcome');
                // Assuming connectedEthAddress is a valid Ethereum address
                if (connectedEthAddress && connectedEthAddress.length >= 42) {
                    const firstFour = connectedEthAddress.substring(0, 4);
                    const lastFour = connectedEthAddress.substring(connectedEthAddress.length - 5);
                    welcomeUser.innerText = `Welcome: ${firstFour}...${lastFour}`;
                } else {
                    welcomeUser.innerText = 'Welcome: Invalid Address';
                }

                // Send the connected address to the backend
                fetch('/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ account: connectedEthAddress }),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Handle the response data
                    console.log(data); // TROUBLESHOOTING REMOVE LATER
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });

            } else {
                console.log("MetaMask is not connected");
            }
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
    } else {
        console.log("MetaMask is not installed!");
    }
}


function displayConnectMessage() {
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = '';
    contentContainer.innerText = 'Please ensure the MetaMask browser extension is installed connect by clicking the connect button in the top right to see portfolio information';
    contentContainer.style.textAlign = 'center';
    contentContainer.style.marginTop = '20px';

    //contentContainer.appendChild(messageDiv); // Adjust this if you want to append the div to a specific container
}


