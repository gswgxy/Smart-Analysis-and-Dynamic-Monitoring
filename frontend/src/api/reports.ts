import { http } from '@/utils/http'

export const reportsApi = {
  generate(payload: Record<string, unknown>) {
    return http.post<{ taskId?: string; reportId?: string }>('/reports/generate', payload, {
      silent: true,
    })
  },
  list() {
    return http.get<unknown[]>('/reports', { silent: true })
  },
}
