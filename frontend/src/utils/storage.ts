export const TOKEN_KEY = 'dip_access_token'
export const USER_KEY = 'dip_current_user'
export const REMEMBER_KEY = 'dip_remembered_username'

export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}
