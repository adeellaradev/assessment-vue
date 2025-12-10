import { listenToUserChannel, leaveUserChannel } from '../services/echo'
import { useToast } from 'vue-toastification'

export function useRealtime() {
  const toast = useToast()

  const setupRealtimeListener = (userId, onTradeMatched, onOrderStatusUpdated) => {
    if (!userId) {
      return null
    }

    const handleOrderMatched = async (event) => {
      const trade = event.trade

      

      // Call the provided callback
      if (onTradeMatched) {
        await onTradeMatched(event)
      }
    }

    const handleOrderStatusUpdated = async (event) => {
      const order = event.order

      // Show notification based on status
      // Status codes: 1 = open, 2 = filled, 3 = cancelled
      if (order.status === 2 || order.status === 'filled') {
       
      } else if (order.status === 'partially_filled') {
        const filledAmount = parseFloat(order.filled_amount) || 0
        const totalAmount = parseFloat(order.amount)
        if (filledAmount > 0 && filledAmount < totalAmount) {
          toast.info(
            `Order partially filled: ${order.filled_amount}/${order.amount} ${order.symbol}`,
            { timeout: 5000 }
          )
        }
      }

      // Call the provided callback
      if (onOrderStatusUpdated) {
        await onOrderStatusUpdated(event)
      }
    }

    // Subscribe to user's private channel for both events
    listenToUserChannel(userId, handleOrderMatched, handleOrderStatusUpdated)

    // Return cleanup function that can be called manually or via onBeforeUnmount in the component
    return () => {
      leaveUserChannel(userId)
    }
  }

  return {
    setupRealtimeListener
  }
}
