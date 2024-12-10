import { API_KEY, API_SECRET } from '../consts.js';
import { Spot } from '@binance/connector';

export class Binance {
    constructor() {
        this.client = new Spot(API_KEY, API_SECRET);
    }

    async getBalances(asset) {
        const { data } = await this.client.account();
        const balances = data.balances.filter(b => b.asset.includes(asset));

        return balances;
    }

    async newOrder({
        symbol,
        side,
        price,
        quantity = 10,
    }) {
        if(!symbol) {
            throw new Error('Symbol is required');
        }

        if(!price) {
            throw new Error('Price is required');
        } else if (price < 0) {
            throw new Error('Price must be greater than 0');
        }

        if(!quantity) {
            throw new Error('Quantity is required');
        } else if (quantity < 10) {
            throw new Error('Quantity must be greater than 10');
        }

        if(!side) {
            throw new Error('Side is required');
        } else if (side !== 'BUY' && side !== 'SELL') {
            throw new Error('Side must be BUY or SELL');
        }

        if(!symbol.includes('USDT')) {
            throw new Error('Symbol must be USDT');
        }

        if(side === 'SELL') {
            const [balance] = await this.getBalances(symbol.replace('USDT', ''));

            if(balance.free < quantity) {
                throw new Error('Not enough balance');
            }
        }

        const type = 'LIMIT';
        const { data: order } = await client.newOrder(symbol, side, type, {
            price,
            quantity,
            timeInForce: 'GTC',
        });
        return order;
    }

    async getOpenOrders(symbol) {
        if(!symbol) {
            throw new Error('Symbol is required');
        }

        const { data: orders } = await this.client.openOrders({ symbol });

        return orders;
    }
}