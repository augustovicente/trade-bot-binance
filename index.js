import { config } from "./config.js";
import { AMOUNT } from "./consts.js";
import { Binance } from "./utils/binance.js";

const binance = new Binance();

const handleNoOrder = async (key, balance, symbol) => {
    // Check if there is balance, if so sell
    if (balance.free > 1) {
        const order = await binance.newOrder({
            symbol,
            side: 'SELL',
            price: config[key].sells[0],
            quantity: AMOUNT,
        });

        console.log('Opened new sell order', order);
    } else {
        // If there is no balance, buy
        const order = await binance.newOrder({
            symbol,
            side: 'BUY',
            price: config[key].buys[0],
            quantity: AMOUNT,
        });

        console.log('Opened new buy order', order);
    }
};

const handleHasOrder = async (order, key, symbol) => {
    if (order.side === 'BUY') {
        for (const buy of config[key].buys) {
            // Check if it is the last price option
            if (order.price < buy) {
                // cancel the order and open a new one
                await binance.cancelOrder(symbol, order.orderId);
                return await binance.newOrder({
                    symbol,
                    side: 'BUY',
                    price: buy,
                    quantity: AMOUNT,
                });
            }
        }
    } else {
        for (const sell of config[key].sells) {
            // Check if it is the last price option
            if (order.price > sell) {
                // cancel the order and open a new one 
                await binance.cancelOrder(symbol, order.orderId);
                return await binance.newOrder({
                    symbol,
                    side: 'SELL',
                    price: sell,
                    quantity: AMOUNT,
                });
            }
        }
    }
};

const main = async () => {
    for (const key in config) {
        const symbol = `${key}USDT`;
        const orders = await binance.getOpenOrders(symbol);
        const [balance] = await binance.getBalances(key);

        if (orders.length > 0) {
            // Check if the order was opened more than 30 minutes ago
            if (new Date().getTime() - orders[0].updateTime > 1800000) {
                await handleHasOrder(orders[0], key, symbol);
            } else {
                // Not important
                console.log('Order was opened less than 30 minutes ago');
            }
        } else {
            await handleNoOrder(key, balance, symbol);
        }
    }
};

main();
