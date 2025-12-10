<template>
  <div class="rounded-lg bg-white p-6 shadow">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">Order Book</h3>

      <!-- Symbol Selection -->
      <select
        v-model="selectedSymbol"
        class="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500">
        <option value="BTC">BTC/USD</option>
        <option value="ETH">ETH/USD</option>
      </select>
    </div>

    <div class="space-y-4">
      <!-- Ask Orders (Sell Orders) -->
      <div>
        <div class="mb-2 flex items-center justify-between px-4 text-xs font-medium uppercase tracking-wider text-gray-500">
          <span>Price (USD)</span>
          <span>Amount</span>
          <span>Total</span>
        </div>

        <div class="space-y-1">
          <div
            v-for="(ask, index) in displayAsks"
            :key="`ask-${index}`"
            class="relative overflow-hidden rounded px-4 py-2">
            <!-- Background bar showing depth -->
            <div
              class="absolute inset-y-0 right-0 bg-red-50"
              :style="{ width: `${(ask.total / maxAskTotal) * 100}%` }">
            </div>

            <div class="relative flex items-center justify-between text-sm">
              <span class="font-medium text-red-600">
                ${{ formatNumber(ask.price) }}
              </span>
              <span class="text-gray-900">
                {{ formatCrypto(ask.amount) }}
              </span>
              <span class="text-gray-600">
                ${{ formatNumber(ask.total) }}
              </span>
            </div>
          </div>

          <div v-if="displayAsks.length === 0" class="py-4 text-center text-sm text-gray-500">
            No sell orders
          </div>
        </div>
      </div>

      <!-- Spread Info -->
      <div class="border-y border-gray-200 bg-gray-50 py-3 text-center">
        <div class="text-lg font-bold text-gray-900">
          {{ lastPrice ? `$${formatNumber(lastPrice)}` : '—' }}
        </div>
        <div class="text-xs text-gray-500">
          Spread: {{ spread ? `$${formatNumber(spread)}` : '—' }}
        </div>
      </div>

      <!-- Bid Orders (Buy Orders) -->
      <div>
        <div class="space-y-1">
          <div
            v-for="(bid, index) in displayBids"
            :key="`bid-${index}`"
            class="relative overflow-hidden rounded px-4 py-2">
            <!-- Background bar showing depth -->
            <div
              class="absolute inset-y-0 right-0 bg-green-50"
              :style="{ width: `${(bid.total / maxBidTotal) * 100}%` }">
            </div>

            <div class="relative flex items-center justify-between text-sm">
              <span class="font-medium text-green-600">
                ${{ formatNumber(bid.price) }}
              </span>
              <span class="text-gray-900">
                {{ formatCrypto(bid.amount) }}
              </span>
              <span class="text-gray-600">
                ${{ formatNumber(bid.total) }}
              </span>
            </div>
          </div>

          <div v-if="displayBids.length === 0" class="py-4 text-center text-sm text-gray-500">
            No buy orders
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  orderbook: {
    type: Object,
    default: () => ({
      BTC: { bids: [], asks: [] },
      ETH: { bids: [], asks: [] }
    })
  },
  lastPrice: {
    type: Number,
    default: null
  }
})

const selectedSymbol = ref('BTC')
const maxDepth = 10

const currentOrderbook = computed(() => {
  return props.orderbook[selectedSymbol.value] || { bids: [], asks: [] }
})

// Process and aggregate orders by price level
const processOrders = (orders) => {
  const priceMap = new Map()

  orders.forEach(order => {
    const price = order.price
    const existing = priceMap.get(price) || { price, amount: 0 }
    existing.amount += (order.amount - (order.filledAmount || 0))
    priceMap.set(price, existing)
  })

  return Array.from(priceMap.values())
    .filter(order => order.amount > 0)
    .map((order, index, array) => {
      // Calculate cumulative total
      const prevTotal = index > 0 ? array[index - 1].total : 0
      order.total = prevTotal + (order.price * order.amount)
      return order
    })
}

const displayBids = computed(() => {
  const processed = processOrders(currentOrderbook.value.bids)
  return processed
    .sort((a, b) => b.price - a.price) // Highest price first
    .slice(0, maxDepth)
})

const displayAsks = computed(() => {
  const processed = processOrders(currentOrderbook.value.asks)
  return processed
    .sort((a, b) => a.price - b.price) // Lowest price first
    .slice(0, maxDepth)
    .reverse() // Display highest to lowest
})

const maxBidTotal = computed(() => {
  if (displayBids.value.length === 0) return 1
  return Math.max(...displayBids.value.map(b => b.total))
})

const maxAskTotal = computed(() => {
  if (displayAsks.value.length === 0) return 1
  return Math.max(...displayAsks.value.map(a => a.total))
})

const spread = computed(() => {
  if (displayAsks.value.length === 0 || displayBids.value.length === 0) return null
  const lowestAsk = Math.min(...displayAsks.value.map(a => a.price))
  const highestBid = Math.max(...displayBids.value.map(b => b.price))
  return lowestAsk - highestBid
})

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatCrypto = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  }).format(value)
}
</script>
