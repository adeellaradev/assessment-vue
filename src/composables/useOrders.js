import { ref } from 'vue'
import { ordersAPI } from '../services/api'
import { useToast } from 'vue-toastification'

export function useOrders() {
  const toast = useToast()
  const orders = ref([])

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getOrders()

      if (data.orders && Array.isArray(data.orders)) {
        orders.value = data.orders.map(order => ({
          id: order.id,
          symbol: order.symbol,
          side: order.side.toUpperCase(),
          price: parseFloat(order.price),
          amount: parseFloat(order.amount),
          filledAmount: parseFloat(order.filled_amount) || 0,
          status: order.status,
          timestamp: order.created_at
        }))
      }

      return orders.value
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error(error.message || 'Failed to load orders')
      throw error
    }
  }

  const placeOrder = async (orderData, currentBalances) => {
    try {
      // Validate balance before placing order
      if (orderData.side === 'BUY') {
        const volume = orderData.price * orderData.amount
        const commission = volume * 0.015
        const totalCost = volume + commission

        if (currentBalances.usd < totalCost) {
          toast.error('Insufficient USD balance')
          return null
        }
      } else if (orderData.side === 'SELL') {
        const assetBalance = currentBalances[orderData.symbol.toLowerCase()]

        if (!assetBalance || assetBalance < orderData.amount) {
          toast.error(`Insufficient ${orderData.symbol} balance`)
          return null
        }
      }

      const result = await ordersAPI.placeOrder(orderData)

      // Check if the order was immediately matched
      // Status codes: 1 = open, 2 = filled, 3 = cancelled
      if (result.order) {
        const order = result.order
        const filledAmount = parseFloat(order.filled_amount) || 0
        const totalAmount = parseFloat(order.amount)

        // Check if order was filled (status = 2) or has filled_amount > 0
        if (order.status === 2 || filledAmount > 0) {
          if (filledAmount >= totalAmount || order.status === 2) {
            // Completely filled
            console.log('🎯 ============================================')
            console.log('🎯 MATCH FOUND! Order was immediately filled!')
            console.log('🎯 Order ID:', order.id)
            console.log('🎯 Symbol:', order.symbol)
            console.log('🎯 Side:', order.side)
            console.log('🎯 Price:', order.price)
            console.log('🎯 Amount:', order.amount)
            console.log('🎯 Filled:', order.filled_amount)
            console.log('🎯 Status:', order.status)
            console.log('🎯 ============================================')
          } else if (filledAmount > 0 && filledAmount < totalAmount) {
            // Partially filled
            console.log('⚡ ============================================')
            console.log('⚡ PARTIAL MATCH! Order was partially filled!')
            console.log('⚡ Order ID:', order.id)
            console.log('⚡ Amount:', order.amount)
            console.log('⚡ Filled Amount:', order.filled_amount)
            console.log('⚡ Remaining:', (totalAmount - filledAmount).toFixed(8))
            console.log('⚡ Status:', order.status)
            console.log('⚡ ============================================')
          }
        }
      }

      toast.success(`${orderData.side} order placed successfully!`)

      return result
    } catch (error) {
      console.error('[useOrders] Failed to place order:', error)
      toast.error(error.message || 'Failed to place order')
      throw error
    }
  }

  const cancelOrder = async (orderId) => {
    try {
      const result = await ordersAPI.cancelOrder(orderId)

      toast.success('Order cancelled successfully')

      return result
    } catch (error) {
      console.error('Failed to cancel order:', error)
      toast.error(error.message || 'Failed to cancel order')
      throw error
    }
  }

  return {
    orders,
    fetchOrders,
    placeOrder,
    cancelOrder
  }
}
