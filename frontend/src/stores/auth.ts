import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { authApi } from '@/api/auth'
import type { PlatformUser } from '@/types'
import { readJson, TOKEN_KEY, USER_KEY, writeJson } from '@/utils/storage'

const roleNames: Record<string, string> = {
  admin: '系统管理员',
  data_admin: '数据管理员',
  user: '普通业务用户',
  analyst: '普通业务用户',
  reviewer: '专家审核员',
  expert: '专家审核员',
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref<PlatformUser | null>(readJson<PlatformUser>(USER_KEY))
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))
  const displayName = computed(() => user.value?.display_name || user.value?.username || '用户')
  const role = computed(() => {
    const rawRole = user.value?.role || ''
    return roleNames[rawRole] || rawRole
  })
  const initials = computed(() => displayName.value.slice(-2))

  function persist(nextToken: string, nextUser: PlatformUser) {
    token.value = nextToken
    user.value = nextUser
    localStorage.setItem(TOKEN_KEY, nextToken)
    writeJson(USER_KEY, nextUser)
  }

  async function login(username: string, password: string) {
    loading.value = true
    try {
      const result = await authApi.login(username, password)
      persist(result.access_token, result.user)
      return result
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return null
    const current = await authApi.me()
    user.value = current
    writeJson(USER_KEY, current)
    return current
  }

  function hasAnyRole(roles?: string[]) {
    if (!roles?.length) return true
    if (role.value === '系统管理员') return true
    return roles.includes(role.value)
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    displayName,
    role,
    initials,
    login,
    fetchCurrentUser,
    hasAnyRole,
    logout,
  }
})
