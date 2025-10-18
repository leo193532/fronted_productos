// src/services/api.js
import axios from 'axios'

// En Vite, las variables de entorno se prefijan con VITE_ en lugar de VUE_APP_
const apiBaseUrl = import.meta.env.VITE_API_URL

// Elimina esta verificación porque import.meta.env puede ser undefined en desarrollo
if (!apiBaseUrl) {
  console.error('La variable de entorno no está definida, verifica tu archivo .env')
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Servicios de autenticación
export const useAuthService = () => {
  const login = async (credentials) => {
    try {
      const response = await api.post('/login', credentials)
      const { token, user } = response.data

      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))

      return { success: true, data: response.data }
    } catch (error) {
      // Manejo de errores HTTP
      if (error.response) {
        // El servidor respondió con un código de error
        return {
          success: false,
          error:
            error.response.data?.error || error.response.data?.message || 'Error en el servidor',
        }
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  }

  const getCurrentUser = async () => {
    try {
      const response = await api.get('/user')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data }
    }
  }

  const isAuthenticated = () => {
    return !!localStorage.getItem('auth_token')
  }

  const getUserData = () => {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  }

  return { login, logout, getCurrentUser, isAuthenticated, getUserData }
}

// Servicios de productos
export const useProductoService = () => {
  const obtenerProductos = async () => {
    try {
      const response = await api.get('/productos')
      return response.data
    } catch (error) {
      console.log('Error al obtener los productos', error)
      throw error
    }
  }

  const crearProducto = async (productoData) => {
    try {
      const response = await api.post('/productos', productoData)
      return response.data
    } catch (error) {
      console.log('Error al crear el producto', error)
      throw error
    }
  }

  const actualizarProducto = async (id, productoData) => {
    try {
      const response = await api.put(`/productos/${id}`, productoData)
      return response.data
    } catch (error) {
      console.log('Error al actualizar el producto', error)
      throw error
    }
  }

  const eliminarProducto = async (id) => {
    try {
      const response = await api.delete(`/productos/${id}`)
      return response.data
    } catch (error) {
      console.log('Error al eliminar el producto', error)
      throw error
    }
  }

  return {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
  }
}

export default api
