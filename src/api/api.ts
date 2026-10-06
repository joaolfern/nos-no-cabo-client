import axios from 'axios'
import { V1_API_URL } from '@/config/env'
import { toApiError } from '@/api/toApiError'

// The /v1 API (Cloudflare Workers). No credentials: it has no admin operations.
export const v1Api = axios.create({
  baseURL: `${new URL(V1_API_URL).href}/`,
  headers: {
    'Content-Type': 'application/json',
  },
})

v1Api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error))
)
