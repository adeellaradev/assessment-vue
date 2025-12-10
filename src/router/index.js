import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Signup from '../pages/Signup.vue'
import Dashboard from '../pages/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken')

  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !token) {
    next('/')
  }
  // If user is authenticated and trying to access login/signup
  else if ((to.path === '/' || to.path === '/signup') && token) {
    next('/dashboard')
  }
  else {
    next()
  }
})

export default router
