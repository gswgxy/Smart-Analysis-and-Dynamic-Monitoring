import type { LoginResult, PlatformUser } from '@/types'
import { http } from '@/utils/http'

export const authApi = {
  login(username: string, password: string) {
    return http.post<LoginResult>('/auth/login', { username, password })
  },
  me() {
    return http.get<PlatformUser>('/auth/me')
  },
}
