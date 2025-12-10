<template>
  <div class="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-sm space-y-10">
      <div>
        <img class="mx-auto h-10 w-auto" src="/src/assets/p.png" alt="Your Company">
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Create your account</h2>
      </div>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="full-name" class="sr-only">Full name</label>
            <input
              id="full-name"
              v-model="fullName"
              name="full-name"
              type="text"
              autocomplete="name"
              required
              :disabled="loading"
              class="relative px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50"
              placeholder="Full name">
          </div>

          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              :disabled="loading"
              class="relative block px-2 w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50"
              placeholder="Email address">
          </div>

          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              :disabled="loading"
              class="relative block px-2 w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50"
              placeholder="Password">
          </div>

          <div>
            <label for="confirm-password" class="sr-only">Confirm password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              name="confirm-password"
              type="password"
              autocomplete="new-password"
              required
              :disabled="loading"
              class="relative block px-2 w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50"
              placeholder="Confirm password">
          </div>
        </div>

        <div class="flex items-center">
          <input
            id="terms"
            v-model="acceptTerms"
            name="terms"
            type="checkbox"
            required
            :disabled="loading"
            class="h-4 w-4 rounded px-2 border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50">
          <label for="terms" class="ml-3 block text-sm leading-6 text-gray-900">
            I agree to the <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Terms and Conditions</a>
          </label>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? 'Creating account...' : 'Sign up' }}
          </button>
        </div>
      </form>

      <p class="text-center text-sm leading-6 text-gray-500">
        Already have an account?
        <router-link to="/" class="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const acceptTerms = ref(false)

const { register, login, loading } = useAuth()

const handleSubmit = async () => {
  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    toast.error('Passwords do not match!')
    return
  }

  // Validate password length
  if (password.value.length < 8) {
    toast.error('Password must be at least 8 characters long.')
    return
  }

  try {
    await register(fullName.value, email.value, password.value, confirmPassword.value)
    router.push('/dashboard')
  } catch (err) {
    if (err.message.includes('404') || err.message.includes('Not Found')) {
      try {
        await login(email.value, password.value)
        router.push('/dashboard')
      } catch (loginErr) {
      }
    }
  }
}
</script>
