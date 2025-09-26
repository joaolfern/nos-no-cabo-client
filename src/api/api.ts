import axios from 'axios'
import { API_URL } from '@/config/env'

export const api = axios.create({
  baseURL: `${new URL(API_URL).href}/`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject(error.response.data)
    }

    return Promise.reject(error)
  }
)

export const openLibraryApi = axios.create({
  baseURL: 'https://openlibrary.org/',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Nós no Cabo/1.0 (joaolfern@proton.me)',
  },
})
