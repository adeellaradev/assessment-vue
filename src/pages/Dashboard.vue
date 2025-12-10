<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation Bar -->
    <Navbar title="Dashboard" :user-name="userName" />

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Welcome, {{ userName }}!</h2>
        <p class="mt-2 text-sm text-gray-600">You have successfully logged in.</p>
      </div>

      <!-- Dashboard Cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div class="overflow-hidden rounded-lg bg-white shadow">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-sm font-medium text-gray-500">Account</h3>
                <p class="text-lg font-semibold text-gray-900">{{ userEmail }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-white shadow">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-sm font-medium text-gray-500">Status</h3>
                <p class="text-lg font-semibold text-gray-900">Active</p>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-white shadow">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-sm font-medium text-gray-500">Last Login</h3>
                <p class="text-lg font-semibold text-gray-900">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Welcome Message -->
      <div class="mt-8 overflow-hidden rounded-lg bg-white shadow">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900">Getting Started</h3>
          <p class="mt-2 text-sm text-gray-600">
            Welcome to your dashboard! This is where you can manage your account and access various features.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Navbar from '../components/Navbar.vue'

const router = useRouter()
const userName = ref('')
const userEmail = ref('')

const { initAuth, user } = useAuth()

onMounted(() => {
  initAuth()

  const token = localStorage.getItem('authToken')
  if (!token) {
    router.push('/')
    return
  }

  if (user.value) {
    userName.value = user.value.name
    userEmail.value = user.value.email
  } else {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      userName.value = userData.name
      userEmail.value = userData.email
    }
  }
})
</script>
