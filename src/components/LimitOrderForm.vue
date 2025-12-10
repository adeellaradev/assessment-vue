<template>
  <div class="rounded-lg bg-white p-6 shadow">
    <h3 class="mb-6 text-lg font-semibold text-gray-900">Place Limit Order</h3>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Symbol Selection -->
      <div>
        <label for="symbol" class="block text-sm font-medium text-gray-700">Symbol</label>
        <select
          id="symbol"
          v-model="formData.symbol"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
          <option value="BTC">BTC/USD</option>
          <option value="ETH">ETH/USD</option>
        </select>
      </div>

      <!-- Side Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Side</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="formData.side = 'BUY'"
            :class="[
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              formData.side === 'BUY'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
            Buy
          </button>
          <button
            type="button"
            @click="formData.side = 'SELL'"
            :class="[
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              formData.side === 'SELL'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
            Sell
          </button>
        </div>
      </div>

      <!-- Price Input -->
      <div>
        <label for="price" class="block text-sm font-medium text-gray-700">Price (USD)</label>
        <div class="relative mt-1">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="price"
            v-model.number="formData.price"
            step="0.01"
            min="0"
            required
            class="block w-full rounded-md border border-gray-300 py-2 pl-7 pr-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="0.00" />
        </div>
      </div>

      <!-- Amount Input -->
      <div>
        <label for="amount" class="block text-sm font-medium text-gray-700">
          Amount ({{ formData.symbol }})
        </label>
        <input
          type="number"
          id="amount"
          v-model.number="formData.amount"
          step="0.00000001"
          min="0"
          required
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="0.00000000" />
      </div>

      <!-- Total Preview -->
      <div class="rounded-md bg-gray-50 p-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Volume:</span>
          <span class="font-medium text-gray-900">
            ${{ totalVolume.toFixed(2) }}
          </span>
        </div>

        <div v-if="formData.side === 'BUY'" class="flex justify-between text-sm">
          <span class="text-gray-600">Commission (1.5%):</span>
          <span class="font-medium text-gray-900">
            ${{ commission.toFixed(2) }}
          </span>
        </div>

        <div class="border-t border-gray-200 pt-2 flex justify-between">
          <span class="text-sm font-semibold text-gray-700">
            {{ formData.side === 'BUY' ? 'Total Cost:' : "You'll Receive:" }}
          </span>
          <span class="font-bold text-gray-900">
            ${{ totalCost.toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="!isFormValid"
        :class="[
          'w-full rounded-md px-4 py-3 text-sm font-semibold text-white transition-colors',
          formData.side === 'BUY'
            ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
            : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400',
          !isFormValid && 'cursor-not-allowed opacity-50'
        ]">
        {{ formData.side === 'BUY' ? 'Place Buy Order' : 'Place Sell Order' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['submit'])

const formData = ref({
  symbol: 'BTC',
  side: 'BUY',
  price: null,
  amount: null
})

const totalVolume = computed(() => {
  if (!formData.value.price || !formData.value.amount) return 0
  return formData.value.price * formData.value.amount
})

const commission = computed(() => {
  if (formData.value.side === 'BUY') {
    return totalVolume.value * 0.015 // 1.5%
  }
  return 0
})

const totalCost = computed(() => {
  if (formData.value.side === 'BUY') {
    return totalVolume.value + commission.value
  }
  return totalVolume.value
})

const isFormValid = computed(() => {
  return formData.value.price > 0 && formData.value.amount > 0
})

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', { ...formData.value })
    // Reset form after submission (optional)
    // formData.value.price = null
    // formData.value.amount = null
  }
}
</script>
