import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'


export function useAuth() {
  const router = useRouter()
  const toast = useToast()
  const loading = ref(false)
  const error = ref('')
  const user = ref(null)
  const token = ref(null)

  
  const initAuth = () => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

 
  const login = async (email, password) => {
    error.value = ''
    loading.value = true

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat()
          const errorMsg = errorMessages.join(', ')
          toast.error(errorMsg)
          throw new Error(errorMsg)
        }
        const errorMsg = data.message || 'Login failed'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }

      token.value = data.token
      user.value = data.user
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success(`Welcome back, ${data.user.name}!`)
      return data
    } catch (err) {
      error.value = err.message || 'Login failed. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  
  const register = async (name, email, password, passwordConfirmation) => {
    error.value = ''
    loading.value = true

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat()
          const errorMsg = errorMessages.join(', ')
          toast.error(errorMsg)
          throw new Error(errorMsg)
        }
        const errorMsg = data.message || 'Registration failed'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }

      token.value = data.token
      user.value = data.user
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success(`Welcome, ${data.user.name}! Your account has been created.`)
      return data
    } catch (err) {
      error.value = err.message || 'Registration failed. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

 
  const logout = async () => {
    loading.value = true

    try {
      const authToken = token.value || localStorage.getItem('authToken')

      if (authToken) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        })
      }

      toast.info('You have been logged out successfully.')
    } catch (err) {
      console.error('Logout error:', err)
      toast.warning('Logged out, but there was an issue with the server.')
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      loading.value = false

      router.push('/')
    }
  }

 
  const getProfile = async () => {
    error.value = ''
    loading.value = true

    try {
      const authToken = token.value || localStorage.getItem('authToken')

      if (!authToken) {
        const errorMsg = 'No authentication token found'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          token.value = null
          user.value = null
          toast.error('Session expired. Please login again.')
          router.push('/')
          throw new Error('Session expired. Please login again.')
        }
        const errorMsg = 'Failed to fetch profile'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }

      const data = await response.json()
      toast.success('Profile loaded successfully')
      return data
    } catch (err) {
      error.value = err.message || 'Failed to fetch profile.'
      throw err
    } finally {
      loading.value = false
    }
  }

  
  const isAuthenticated = () => {
    return !!(token.value || localStorage.getItem('authToken'))
  }

  return {
    loading,
    error,
    user,
    token,

    initAuth,
    login,
    register,
    logout,
    getProfile,
    isAuthenticated,
  }
}
