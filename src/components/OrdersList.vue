<template>
  <div class="rounded-lg bg-white p-6 shadow">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">Orders</h3>

      <!-- Filter Controls -->
      <div class="flex space-x-2">
        <select
          v-model="filters.symbol"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500">
          <option value="">All Symbols</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
        </select>

        <select
          v-model="filters.side"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500">
          <option value="">All Sides</option>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>

        <select
          v-model="filters.status"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500">
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="FILLED">Filled</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Time
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Symbol
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Side
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Price
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Amount
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Filled
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Total
            </th>
            <th scope="col" class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th scope="col" class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Action
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="filteredOrders.length === 0">
            <td colspan="9" class="px-4 py-8 text-center text-sm text-gray-500">
              No orders found
            </td>
          </tr>
          <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50">
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
              {{ formatTime(order.timestamp) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
              {{ order.symbol }}/USD
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm">
              <span :class="[
                'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                order.side === 'BUY'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              ]">
                {{ order.side }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
              ${{ formatNumber(order.price) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
              {{ formatCrypto(order.amount) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
              {{ formatCrypto(order.filledAmount || 0) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
              ${{ formatNumber(order.price * order.amount) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-center text-sm">
              <span :class="[
                'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                getStatusClass(order.status)
              ]">
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-center text-sm">
              <button
                v-if="order.status === 'OPEN' || order.status === 1"
                @click="handleCancelOrder(order.id)"
                class="rounded-md bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors">
                Cancel
              </button>
              <span v-else class="text-gray-400 text-xs">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="filteredOrders.length > 0" class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
      <div class="flex items-center space-x-2">
        <p class="text-sm text-gray-700">
          Showing <span class="font-medium">{{ startIndex + 1 }}</span> to <span class="font-medium">{{ Math.min(endIndex, filteredOrders.length) }}</span> of <span class="font-medium">{{ filteredOrders.length }}</span> orders
        </p>
        <select
          v-model="pagination.perPage"
          @change="handlePerPageChange"
          class="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500">
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
        </select>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="goToFirstPage"
          :disabled="pagination.currentPage === 1"
          :class="[
            'rounded-md px-3 py-1 text-sm font-medium transition-colors',
            pagination.currentPage === 1
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          ]">
          First
        </button>
        <button
          @click="goToPreviousPage"
          :disabled="pagination.currentPage === 1"
          :class="[
            'rounded-md px-3 py-1 text-sm font-medium transition-colors',
            pagination.currentPage === 1
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          ]">
          Previous
        </button>

        <div class="flex items-center space-x-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              pagination.currentPage === page
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            ]">
            {{ page }}
          </button>
        </div>

        <button
          @click="goToNextPage"
          :disabled="pagination.currentPage === totalPages"
          :class="[
            'rounded-md px-3 py-1 text-sm font-medium transition-colors',
            pagination.currentPage === totalPages
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          ]">
          Next
        </button>
        <button
          @click="goToLastPage"
          :disabled="pagination.currentPage === totalPages"
          :class="[
            'rounded-md px-3 py-1 text-sm font-medium transition-colors',
            pagination.currentPage === totalPages
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          ]">
          Last
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['cancel'])

const filters = ref({
  symbol: '',
  side: '',
  status: ''
})

const pagination = ref({
  currentPage: 1,
  perPage: 10
})

const handleCancelOrder = (orderId) => {
  emit('cancel', orderId)
}

// First, get all filtered orders (without pagination)
const allFilteredOrders = computed(() => {
  let result = [...props.orders]

  if (filters.value.symbol) {
    result = result.filter(order => order.symbol === filters.value.symbol)
  }

  if (filters.value.side) {
    result = result.filter(order => order.side === filters.value.side)
  }

  if (filters.value.status) {
    result = result.filter(order => {
      // Handle both numeric (1,2,3) and string ('OPEN','FILLED','CANCELLED') status
      const statusMap = {
        'OPEN': [1, 'OPEN'],
        'FILLED': [2, 'FILLED'],
        'CANCELLED': [3, 'CANCELLED']
      }
      const validStatuses = statusMap[filters.value.status] || []
      return validStatuses.includes(order.status)
    })
  }

  // Sort by timestamp (newest first)
  return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(allFilteredOrders.value.length / pagination.value.perPage)
})

const startIndex = computed(() => {
  return (pagination.value.currentPage - 1) * pagination.value.perPage
})

const endIndex = computed(() => {
  return startIndex.value + pagination.value.perPage
})

// Paginated orders to display
const filteredOrders = computed(() => {
  return allFilteredOrders.value.slice(startIndex.value, endIndex.value)
})

// Calculate visible page numbers (show max 5 pages at a time)
const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = pagination.value.currentPage

  if (total <= 5) {
    // Show all pages if 5 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Show current page with 2 pages on each side when possible
    let start = Math.max(1, current - 2)
    let end = Math.min(total, current + 2)

    // Adjust if we're near the beginning or end
    if (current <= 3) {
      end = 5
    } else if (current >= total - 2) {
      start = total - 4
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    pagination.value.currentPage = page
  }
}

const goToFirstPage = () => {
  pagination.value.currentPage = 1
}

const goToLastPage = () => {
  pagination.value.currentPage = totalPages.value
}

const goToPreviousPage = () => {
  if (pagination.value.currentPage > 1) {
    pagination.value.currentPage--
  }
}

const goToNextPage = () => {
  if (pagination.value.currentPage < totalPages.value) {
    pagination.value.currentPage++
  }
}

const handlePerPageChange = () => {
  // Reset to first page when changing items per page
  pagination.value.currentPage = 1
}

// Reset to first page when filters change
watch(filters, () => {
  pagination.value.currentPage = 1
}, { deep: true })

const getStatusClass = (status) => {
  // Handle both numeric (1,2,3) and string ('OPEN','FILLED','CANCELLED') status
  const statusMap = {
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-green-100 text-green-800',
    3: 'bg-gray-100 text-gray-800',
    'OPEN': 'bg-blue-100 text-blue-800',
    'FILLED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-gray-100 text-gray-800'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const statusTextMap = {
    1: 'OPEN',
    2: 'FILLED',
    3: 'CANCELLED'
  }
  return statusTextMap[status] || status
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

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
