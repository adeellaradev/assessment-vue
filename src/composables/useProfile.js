import { ref } from 'vue'
import { profileAPI } from '../services/api'
import { useToast } from 'vue-toastification'

export function useProfile() {
  const toast = useToast()

  const userName = ref('')
  const userEmail = ref('')
  const userId = ref(null)
  const balances = ref({
    usd: 0,
    btc: 0,
    eth: 0
  })

  const fetchProfile = async () => {
    try {
      const data = await profileAPI.getProfile()

      // Update balances
      balances.value.usd = parseFloat(data.user.balance) || 0

      // Update user info
      userName.value = data.user.name
      userEmail.value = data.user.email
      userId.value = data.user.id

      // Process assets
      if (data.assets && Array.isArray(data.assets)) {
        // Reset asset balances first
        balances.value.btc = 0
        balances.value.eth = 0

        data.assets.forEach(asset => {
          const symbol = asset.symbol.toLowerCase()
          if (symbol === 'btc') {
            balances.value.btc = parseFloat(asset.available_amount) || 0
          } else if (symbol === 'eth') {
            balances.value.eth = parseFloat(asset.available_amount) || 0
          }
        })
      }

      return data
    } catch (error) {
      toast.error(error.message || 'Failed to load profile')
      throw error
    }
  }

  return {
    userName,
    userEmail,
    userId,
    balances,
    fetchProfile
  }
}
