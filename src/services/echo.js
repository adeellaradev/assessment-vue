import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

let echoInstance = null

export const initEcho = () => {
  if (echoInstance) {
    return echoInstance
  }

  const token = localStorage.getItem('authToken')
  const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY
  const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (!pusherKey || !pusherCluster) {
    console.warn('Pusher credentials not configured. Real-time updates will not work.')
    return null
  }

  // Extract base URL properly (remove /api suffix if present, then add /api/broadcasting/auth)
  const baseUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl
  const authEndpoint = `${baseUrl}/api/broadcasting/auth`

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: pusherKey,
    cluster: pusherCluster,
    forceTLS: true,
    authEndpoint: authEndpoint,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
    enabledTransports: ['ws', 'wss'],
  })

  // Add connection debugging
  if (echoInstance.connector && echoInstance.connector.pusher) {
    const pusher = echoInstance.connector.pusher

    pusher.connection.bind('connected', () => {
      console.log('[Pusher] ✅ Connected! Socket ID:', pusher.connection.socket_id)
    })

    pusher.connection.bind('error', (err) => {
      console.error('[Pusher] ❌ Connection error:', err)
    })
  }

  return echoInstance
}

export const getEcho = () => {
  if (!echoInstance) {
    return initEcho()
  }
  return echoInstance
}

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}

export const listenToUserChannel = (userId, onOrderMatched, onOrderUpdated) => {
  const echo = getEcho()

  if (!echo) {
    console.warn('[Echo] Echo instance not available, cannot subscribe')
    return null
  }

  const channelName = `private-user.${userId}`
  console.log('========================================')
  console.log('[Echo] 🔔 Subscribing to channel:', channelName)
  console.log('[Echo] User ID:', userId)
  console.log('========================================')

  const channel = echo.private(`user.${userId}`)

  // Add subscription event handlers
  channel.subscribed(() => {
    console.log('========================================')
    console.log('[Echo] ✅ Successfully subscribed to:', channelName)
    console.log('========================================')
  })

  channel.error((error) => {
    console.error('========================================')
    console.error('[Echo] ❌ Subscription error for:', channelName)
    console.error('[Echo] Error:', error)
    console.error('========================================')
  })

  // Listen for ALL events (to debug what's actually being received)
  channel.listenToAll((eventName, data) => {
    console.log('========================================')
    console.log('[Pusher] 📡 ANY EVENT RECEIVED!')
    console.log('[Pusher] Event name:', eventName)
    console.log('[Pusher] Event data:', JSON.stringify(data, null, 2))
    console.log('========================================')
  })

  // Listen for order matched events
  channel.listen('.order.matched', (event) => {
    console.log('========================================')
    console.log('[Pusher] 🎯 ORDER MATCHED EVENT!')
    console.log('[Pusher] Full event object:', JSON.stringify(event, null, 2))
    console.log('[Pusher] Event keys:', Object.keys(event))
    if (event.trade) {
      console.log('[Pusher] Trade data:', event.trade)
    }
    console.log('========================================')
    if (onOrderMatched) {
      onOrderMatched(event)
    }
  })

  // Try listening without the dot prefix
  channel.listen('order.matched', (event) => {
    console.log('========================================')
    console.log('[Pusher] 🎯 ORDER MATCHED (no dot)!')
    console.log('[Pusher] Full event object:', JSON.stringify(event, null, 2))
    console.log('========================================')
    if (onOrderMatched) {
      onOrderMatched(event)
    }
  })

  // Try listening for OrderMatched
  channel.listen('OrderMatched', (event) => {
    console.log('========================================')
    console.log('[Pusher] 🎯 OrderMatched class name!')
    console.log('[Pusher] Full event object:', JSON.stringify(event, null, 2))
    console.log('========================================')
    if (onOrderMatched) {
      onOrderMatched(event)
    }
  })

  // Listen for order status updates (filled, partially filled, etc.)
  channel.listen('.order.status.updated', (event) => {
    console.log('========================================')
    console.log('[Pusher] 📊 ORDER STATUS UPDATED!')
    console.log('[Pusher] Full event object:', JSON.stringify(event, null, 2))
    console.log('[Pusher] Event keys:', Object.keys(event))
    if (event.order) {
      console.log('[Pusher] Order data:', event.order)
      console.log('[Pusher] Order status:', event.order.status)
      console.log('[Pusher] Order ID:', event.order.id)
    }
    console.log('========================================')
    if (onOrderUpdated) {
      onOrderUpdated(event)
    }
  })

  return channel
}

export const leaveUserChannel = (userId) => {
  const echo = getEcho()
  if (echo) {
    echo.leave(`user.${userId}`)
  }
}

