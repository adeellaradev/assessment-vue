<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation Bar -->
    <Navbar title="Trading Dashboard" :user-name="userName" />

    <!-- Main Content -->
    <main class="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 lg:px-8">
    
      <!-- Main Grid Layout -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <!-- Left Column: Order Form + Wallet -->
        <div class="space-y-6 lg:col-span-3">
          <!-- Limit Order Form -->
          <LimitOrderForm @submit="handlePlaceOrder" />

          <!-- Wallet Balance -->
          <WalletBalance
            :balances="balances"
            :btc-price="btcPrice"
            :eth-price="ethPrice" />
        </div>

        <!-- Middle Column: Orders List -->
        <div class="lg:col-span-6">
          <OrdersList :orders="orders" @cancel="handleCancelOrder" />
        </div>

        <!-- Right Column: Orderbook -->
        <div class="lg:col-span-3">
          <Orderbook
            :orderbook="orderbook"
            :last-price="lastPrice" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useProfile } from '../composables/useProfile'
import { useOrders } from '../composables/useOrders'
import { useOrderbook } from '../composables/useOrderbook'
import { useRealtime } from '../composables/useRealtime'
import Navbar from '../components/Navbar.vue'
import LimitOrderForm from '../components/LimitOrderForm.vue'
import WalletBalance from '../components/WalletBalance.vue'
import OrdersList from '../components/OrdersList.vue'
import Orderbook from '../components/Orderbook.vue'

const router = useRouter()
const { initAuth } = useAuth()

// Composables
const { userName, userId, balances, fetchProfile } = useProfile()
const { orders, placeOrder, cancelOrder, fetchOrders } = useOrders()
const { orderbook, btcPrice, ethPrice, lastPrice, fetchOrderbook, fetchAllOrderbooks } = useOrderbook()
const { setupRealtimeListener } = useRealtime()

// Handle placing a new order
const handlePlaceOrder = async (orderData) => {
  const result = await placeOrder(orderData, balances.value)

  if (result) {
    // Refresh data after successful order placement
    await Promise.all([
      fetchProfile(),
      fetchOrders(),
      fetchOrderbook(orderData.symbol)
    ])
  }
}

// Handle cancelling an order
const handleCancelOrder = async (orderId) => {
  await cancelOrder(orderId)

  // Refresh data after cancellation
  await Promise.all([
    fetchProfile(),
    fetchOrders()
  ])
}

// Handle real-time trade matched event
const handleTradeMatched = async (event) => {
  const trade = event.trade

  // Refresh all data
  await Promise.all([
    fetchProfile(),
    fetchOrders(),
    fetchOrderbook(trade.symbol)
  ])
}

// Handle real-time order status update
const handleOrderStatusUpdated = async (event) => {
  const order = event.order

  // Refresh all data when order status changes
  await Promise.all([
    fetchProfile(),
    fetchOrders(),
    fetchOrderbook(order.symbol)
  ])
}

// Store cleanup function
let cleanupRealtime = null

onMounted(async () => {
  initAuth()

  const token = localStorage.getItem('authToken')
  if (!token) {
    router.push('/')
    return
  }

  // Fetch initial data
  await fetchProfile()
  await fetchOrders()
  await fetchAllOrderbooks()

  // Setup real-time updates for both trade matching and order status updates
  if (userId.value) {
    cleanupRealtime = setupRealtimeListener(userId.value, handleTradeMatched, handleOrderStatusUpdated)
  }
})

onBeforeUnmount(() => {
  if (cleanupRealtime) {
    cleanupRealtime()
  }
})
</script>
