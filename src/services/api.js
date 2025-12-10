const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'


async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken')

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        window.location.href = '/'
        throw new Error('Session expired. Please login again.')
      }

      if (response.status === 422 && data.errors) {
        const errorMessages = Object.values(data.errors).flat()
        throw new Error(errorMessages.join(', '))
      }

      throw new Error(data.message || 'Request failed')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}


export const authAPI = {
  
  login: (email, password) =>
    apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

 
  logout: () =>
    apiRequest('/logout', {
      method: 'POST',
    }),

  
  getProfile: () => apiRequest('/profile'),
}

export default {
  authAPI,
}
