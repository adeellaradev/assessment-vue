<template>
  <div class="rounded-lg bg-white p-6 shadow">
    <h3 class="mb-4 text-lg font-semibold text-gray-900">Wallet Balances</h3>

    <div class="space-y-4">
      <!-- USD Balance -->
      <div class="rounded-md border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">USD Balance</p>
              <p class="text-2xl font-bold text-gray-900">
                ${{ formatNumber(balances.usd) }}
              </p>
            </div>
          </div>
          <span class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">USD</span>
        </div>
      </div>

      <!-- BTC Balance -->
      <div class="rounded-md border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <svg class="h-6 w-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">BTC Balance</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatCrypto(balances.btc) }}
              </p>
            </div>
          </div>
          <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">BTC</span>
        </div>
        <p class="mt-2 text-xs text-gray-500">
          ≈ ${{ formatNumber(balances.btc * btcPrice) }}
        </p>
      </div>

      <!-- ETH Balance -->
      <div class="rounded-md border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <svg class="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">ETH Balance</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatCrypto(balances.eth) }}
              </p>
            </div>
          </div>
          <span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">ETH</span>
        </div>
        <p class="mt-2 text-xs text-gray-500">
          ≈ ${{ formatNumber(balances.eth * ethPrice) }}
        </p>
      </div>

      <!-- Total Portfolio Value -->
      <div class="rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
        <p class="text-sm font-medium opacity-90">Total Portfolio Value</p>
        <p class="text-3xl font-bold">
          ${{ formatNumber(totalValue) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  balances: {
    type: Object,
    default: () => ({
      usd: 10000,
      btc: 0,
      eth: 0
    })
  },
  btcPrice: {
    type: Number,
    default: 50000
  },
  ethPrice: {
    type: Number,
    default: 3000
  }
})

const totalValue = computed(() => {
  return props.balances.usd +
         (props.balances.btc * props.btcPrice) +
         (props.balances.eth * props.ethPrice)
})

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatCrypto = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  }).format(value)
}
</script>
