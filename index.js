import { config } from "./config.js";
import { Binance } from "./utils/binance.js";


const main = async () => {
    const binance = new Binance();

    for (const key in config) {
        const orders = await binance.getOpenOrders(`${key}USDT`);
        const [balance] = await binance.getBalances(key);

        if (orders.length > 0) {
            if (new Date().getTime() - orders[0].updateTime > 1800000) {
                console.log('Order was opened more than 30 minutes ago');

                for (const buy of config[key].buys) {
                    // Check if it is the last price option
                        // If it is the last price option, cancel the order and open a new one
                }
            }

            console.log('Order was opened less than 30 minutes ago');
        } else {
            // Check if there is balance, if so sell
            if (balance.free > 1) {
                const order = await binance.newOrder({
                    symbol: `${key}USDT`,
                    side: 'SELL',
                    price: config[key].sells[0],
                    quantity: 10,
                });

                console.log('Opened new sell order', order);
            } else {
                // If there is no balance, buy
                const order = await binance.newOrder({
                    symbol: `${key}USDT`,
                    side: 'BUY',
                    price: config[key].buys[0],
                    quantity: 10,
                });

                console.log('Opened new buy order', order);
            }
        }
    }
};

main();