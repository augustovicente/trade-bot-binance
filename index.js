import { config } from "./config.js";
import { Binance } from "./utils/binance.js";

const binance = new Binance();

const main = async () => {
    for (const key in config) {
        await processSymbol(key);
    }
};

const processSymbol = async (key) => {
    const symbol = `${key}USDT`;
    try {
        const orders = await binance.getOpenOrders(symbol);
        const [balance] = await binance.getBalances(key);

        if (orders.length > 0) {
            await handleExistingOrders(symbol, orders, key);
        } else {
            await handleNoOrders(symbol, key, balance);
        }
    } catch (error) {
        console.error(`Error processing ${symbol}:`, error.message);
    }
};

const handleExistingOrders = async (symbol, orders, key) => {
    const order = orders[0];
    const orderAge = Date.now() - order.updateTime;

    if (orderAge > 30 * 60 * 1000) { // 30 minutes
        console.log(`Order for ${symbol} is older than 30 minutes.`);

        // Cancel the old order
        await binance.cancelOrder({ symbol, orderId: order.orderId });
        console.log(`Canceled order ${order.orderId} for ${symbol}.`);

        // Place a new order with the next price option
        await placeNextOrder(symbol, key, order.side, order.price);
    } else {
        console.log(`Order for ${symbol} is less than 30 minutes old.`);
    }
};

const handleNoOrders = async (symbol, key, balance) => {
    if (balance.free > 1) {
        await placeSellOrder(symbol, key);
    } else {
        await placeBuyOrder(symbol, key);
    }
};

const placeSellOrder = async (symbol, key) => {
    const price = config[key].sells[0];
    const quantity = 10;

    const order = await binance.newOrder({
        symbol,
        side: 'SELL',
        price,
        quantity,
    });

    console.log(`Opened new sell order for ${symbol}.`, order);
};

const placeBuyOrder = async (symbol, key) => {
    const price = config[key].buys[0];
    const quantity = 10;

    const order = await binance.newOrder({
        symbol,
        side: 'BUY',
        price,
        quantity,
    });

    console.log(`Opened new buy order for ${symbol}.`, order);
};

const placeNextOrder = async (symbol, key, side, currentPrice) => {
    const prices = side === 'BUY' ? config[key].buys : config[key].sells;
    const nextPrice = getNextPrice(prices, parseFloat(currentPrice));

    if (nextPrice) {
        const quantity = 10;

        const order = await binance.newOrder({
            symbol,
            side,
            price: nextPrice,
            quantity,
        });

        console.log(`Opened new ${side.toLowerCase()} order for ${symbol} at price ${nextPrice}.`, order);
    } else {
        console.log(`No more price options for ${symbol}.`);
    }
};

const getNextPrice = (prices, currentPrice) => {
    const tolerance = 1e-8; // For floating-point comparison
    const index = prices.findIndex(price => Math.abs(price - currentPrice) < tolerance);
    return index >= 0 && index < prices.length - 1 ? prices[index + 1] : null;
};

main();