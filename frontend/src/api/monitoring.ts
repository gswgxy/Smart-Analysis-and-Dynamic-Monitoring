import type { OverviewPayload } from '@/types'
import { http } from '@/utils/http'

export const monitoringApi = {
  overview() {
    return http.get<OverviewPayload>('/monitoring/overview')
  },
}
