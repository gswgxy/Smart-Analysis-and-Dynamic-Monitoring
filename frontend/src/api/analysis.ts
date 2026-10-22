import type { QaAnswer } from '@/types'
import { http } from '@/utils/http'

export const analysisApi = {
  ask(question: string, context?: Record<string, unknown>) {
    return http.post<QaAnswer>(
      '/qa/ask',
      { question, context },
      { silent: true, timeout: 10000 },
    )
  },
  chain(payload: Record<string, unknown>) {
    return http.post<Record<string, unknown>>('/analysis/chain', payload)
  },
  topic(payload: Record<string, unknown>) {
    return http.post<Record<string, unknown>>('/analysis/topic', payload)
  },
  risk(payload: Record<string, unknown>) {
    return http.post<Record<string, unknown>>('/analysis/risk', payload)
  },
}
