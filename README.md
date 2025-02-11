# Trade Bot Binance

A simple trade bot for Binance that buys and sells stablecoins based on their prices.

## Installation

1. Install Node.js if you haven't already.
2. Clone this repository.
3. Run `yarn install` in the repository root.
4. Create a `.env` file in the repository root with your Binance API key and secret.
5. Choose the amount ($ USDT) you want to trade for each pair and fill in the `.env` `AMOUNT`. 
*NOTE* that there are 4 pairs, so if you choose `100`, for example, you should have `400` available in your account in Binance Spot Account.

## Run in background

1. Install pm2 `npm i -g pm2`
2. Run `pm2 start index.js --name "trade-bot-binance" --no-autorestart --cron "*/1 * * * *"`
