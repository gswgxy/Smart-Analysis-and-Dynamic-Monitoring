import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

import type { ApiResponse } from '@/types'
import { TOKEN_KEY, USER_KEY } from '@/utils/storage'

declare module 'axios' {
  export interface AxiosRequestConfig {
    silent?: boolean
  }
}

export class ApiError extends Error {
  code: number
  traceId?: string
  status?: number

  constructor(message: string, code = -1, traceId?: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.traceId = traceId
    this.status = status
  }
}

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
})

service.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function handleUnauthorized(config?: AxiosRequestConfig) {
  clearSession()
  if (config?.url?.includes('/auth/login')) return
  if (window.location.pathname === '/login') return

  ElMessage.error('登录状态已失效，请重新登录')
  const redirect = `${window.location.pathname}${window.location.search}`
  window.location.replace(`/login?redirect=${encodeURIComponent(redirect)}`)
}

function notifyError(message: string, traceId?: string) {
  ElMessage.error({
    message: traceId ? `${message}（traceId: ${traceId}）` : message,
    duration: 5000,
    showClose: true,
  })
}

service.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined
    const body = error.response?.data as Partial<ApiResponse<unknown>> | undefined
    const message =
      body?.message ||
      (status === 403
        ? '当前账号无权访问该功能'
        : status === 500
          ? '服务暂时不可用，请稍后重试'
          : error.code === 'ECONNABORTED'
            ? '请求超时，请检查网络或后端服务'
            : error.message || '请求失败')

    if (status === 401) {
      handleUnauthorized(error.config)
    } else if (!error.config?.silent) {
      notifyError(message, body?.traceId)
    }

    if (status === 403 && !error.config?.silent) {
      window.location.assign('/403')
    }

    return Promise.reject(
      new ApiError(message, body?.code ?? status ?? -1, body?.traceId, status),
    )
  },
)

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  const body = response.data
  if (!body || body.code !== 0) {
    const message = body?.message || '接口返回异常'
    notifyError(message, body?.traceId)
    throw new ApiError(message, body?.code ?? -1, body?.traceId)
  }
  return body.data
}

export const http = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return unwrap<T>(service.get<ApiResponse<T>>(url, config))
  },
  post<T>(url: string, payload?: unknown, config?: AxiosRequestConfig) {
    return unwrap<T>(service.post<ApiResponse<T>>(url, payload, config))
  },
  put<T>(url: string, payload?: unknown, config?: AxiosRequestConfig) {
    return unwrap<T>(service.put<ApiResponse<T>>(url, payload, config))
  },
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return unwrap<T>(service.delete<ApiResponse<T>>(url, config))
  },
}
