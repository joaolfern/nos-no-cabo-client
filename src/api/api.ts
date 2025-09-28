import axios from 'axios'
import { ADMIN_PASSWORD, API_URL, isAdminMode } from '@/config/env'

export const api = axios.create({
  baseURL: `${new URL(API_URL).href}/`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (isAdminMode) {
    config.headers['x-admin-password'] = ADMIN_PASSWORD
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      error.response.data.message = error.response.data.error || error.message
      return Promise.reject(error.response.data)
    }

    return Promise.reject(error)
  }
)

export const openLibraryApi = axios.create({
  baseURL: 'https://openlibrary.org/',
  headers: {
    'Content-Type': 'application/json',
  },
})
