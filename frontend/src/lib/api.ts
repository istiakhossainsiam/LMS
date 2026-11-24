import { useAppStore } from '../stores/useAppStore'

const API_BASE = '/api/v1'

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken, clearAuth, showToast } = useAppStore.getState()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 && accessToken && !path.startsWith('/auth/')) {
    clearAuth()
    showToast('Session expired or signed in on another device. Please sign in again.', 'error')
  }

  if (!response.ok) {
    let errorDetail = `Request failed (${response.status})`
    try {
      const errJson = await response.json()
      errorDetail = errJson.detail || errJson.message || errorDetail
    } catch {
      // ignore
    }
    throw new Error(errorDetail)
  }

  return response.json() as Promise<T>
}
