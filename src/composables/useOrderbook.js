import { ref } from 'vue'
import { orderbookAPI } from '../services/api'

export function useOrderbook() {
  const orderbook = ref({
    BTC: { bids: [], asks: [] },
    ETH: { bids: [], asks: [] }
  })

  const btcPrice = ref(50000)
  const ethPrice = ref(3000)
  const lastPrice = ref(50000)

  const fetchOrderbook = async (symbol) => {
    try {
      const data = await orderbookAPI.getOrderbook(symbol)

      if (data) {
        orderbook.value[symbol] = {
          bids: data.buy_orders || [],
          asks: data.sell_orders || []
        }

        // Calculate mid-market price from best bid and best ask
        const bestBid = data.buy_orders && data.buy_orders.length > 0
          ? parseFloat(data.buy_orders[0].price)
          : null
        const bestAsk = data.sell_orders && data.sell_orders.length > 0
          ? parseFloat(data.sell_orders[0].price)
          : null

        // Use mid-market price if both bid and ask are available
        let price = null
        if (bestBid && bestAsk) {
          // Mid-market price (average of best bid and best ask)
          price = (bestBid + bestAsk) / 2
        } else if (bestBid) {
          // Only bids available, use best bid
          price = bestBid
        } else if (bestAsk) {
          // Only asks available, use best ask
          price = bestAsk
        }

        // Update price references only if we have a valid price
        // This keeps the default/previous prices if orderbook is empty
        if (price && price > 0) {
          if (symbol === 'BTC') {
            btcPrice.value = price
            lastPrice.value = price
          } else if (symbol === 'ETH') {
            ethPrice.value = price
          }
        }
      }

      return orderbook.value[symbol]
    } catch (error) {
      // Don't show error toast for orderbook failures, just fail silently
      throw error
    }
  }

  const fetchAllOrderbooks = async () => {
    try {
      await Promise.all([
        fetchOrderbook('BTC'),
        fetchOrderbook('ETH')
      ])
    } catch (error) {
      // Fail silently
    }
  }

  return {
    orderbook,
    btcPrice,
    ethPrice,
    lastPrice,
    fetchOrderbook,
    fetchAllOrderbooks
  }
}
