

// window.onload = () => {
//     const contentContainer = document.getElementById('content-container');
//     contentContainer.innerHTML = `
//         <div class="welcome-page">
//             <h1>Welcome to Our Website</h1>
//             <p>Some introductory text or instructions.</p>
//             <button id="enter-site">Enter Site</button>
//         </div>
//     `;
// };

// document.addEventListener('DOMContentLoaded', () => {
//     document.getElementById('enter-site').addEventListener('click', () => {
//         loadContent('Market'); // Assuming 'Home' is your default view
//     });
// });





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
    // fields that are needed 
    
    // .market_cap_rank
    // .image
    // .id
    // .current_price
    // .price_change_percentage_24h_in_currency
    // .price_change_percentage_7d_in_currency
    // .market_cap
    // .total_volume

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















































document.querySelectorAll('.navbar-links a').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const page = this.textContent.trim();
        loadContent(page);
    });
});



function loadContent(page) {
    const contentContainer = document.getElementById('content-container');
    switch (page) {
        case 'Portfolio':
            contentContainer.innerHTML = '<p>Portfolio content goes here.</p>';
            break;
        case 'Coin Screener':
            contentContainer.innerHTML = '<p>Coin Screener content goes here.</p>';
            break;
        case 'Market':
            loadMarketContent();
            break;
        case 'Wallet Analysis':
            contentContainer.innerHTML = '<p>Wallet Analysis content goes here.</p>';
            break;
    }
}











document.querySelector(".metamask-connect").addEventListener("click", login);

async function login() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log(accounts); // TROUBLESHOOTING REMOVE LATER
            const account = accounts[0];
            fetch('http://localhost:3000/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ account }),
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
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
    } else {
        console.log("MetaMask is not installed!");
    }
}
