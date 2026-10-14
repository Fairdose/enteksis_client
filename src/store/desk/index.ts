import { defineStore } from 'pinia'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
export const deskSessionKey = 'enteksis-desk-session'

type Session = { access_token: string; refresh_token: string; actor_id: string }
type ErrorBody = { error?: string }
const errorMessages: Record<string, string> = {
  forbidden: 'Bu işlem için yetkiniz yok.',
  stale_assignment: 'Atama değişti. Görevi yeniden açıp güncel bilgiyle deneyin.',
  invalid_transition: 'Görev durumu değişti. Görevi yenileyip tekrar deneyin.',
  blocker_reason_required: 'Engel gerekçesi yazın.',
  reason_required: 'Yeniden atama gerekçesi yazın.',
  idempotency_conflict: 'Aynı işlem anahtarı farklı veriyle kullanıldı.',
  required_evidence_missing: 'Zorunlu kabul ölçütleri için kanıt bağlantısı ekleyin.',
  invalid_evidence_url: 'Kanıt bağlantısı geçerli bir http veya https adresi olmalı.',
}

function readSession(): Session | null {
  try {
    return JSON.parse(window.sessionStorage.getItem(deskSessionKey) || 'null') as Session | null
  } catch {
    return null
  }
}

export const useDeskStore = defineStore('desk', {
  state: () => ({ session: readSession(), error: '' }),
  getters: { isAuthenticated: (state) => Boolean(state.session?.access_token) },
  actions: {
    async login(email: string, password: string): Promise<boolean> {
      this.error = ''
      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        })
        const body = (await response.json()) as Session & ErrorBody
        if (!response.ok) throw new Error(body.error || 'Giriş yapılamadı.')
        this.session = body
        window.sessionStorage.setItem(deskSessionKey, JSON.stringify(body))
        return true
      } catch (cause) {
        this.error = cause instanceof Error ? cause.message : 'Giriş yapılamadı.'
        return false
      }
    },
    async logout() {
      const token = this.session?.access_token
      this.session = null
      window.sessionStorage.removeItem(deskSessionKey)
      if (token) {
        await fetch(`${apiBaseUrl}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => undefined)
      }
    },
    async refresh(): Promise<boolean> {
      if (!this.session) return false
      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: this.session.refresh_token }),
        })
        if (!response.ok) return false
        const body = (await response.json()) as Session
        this.session = body
        window.sessionStorage.setItem(deskSessionKey, JSON.stringify(body))
        return true
      } catch {
        return false
      }
    },
    async deskFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
      const send = () => {
        const headers = new Headers(init.headers)
        if (this.session) headers.set('Authorization', `Bearer ${this.session.access_token}`)
        return fetch(`${apiBaseUrl}/api/v1${path}`, { ...init, headers })
      }
      let response = await send()
      if (response.status === 401 && (await this.refresh())) response = await send()
      const body = (await response.json().catch(() => ({}))) as T & ErrorBody
      if (!response.ok) {
        if (response.status === 401) {
          this.session = null
          window.sessionStorage.removeItem(deskSessionKey)
        }
        throw new Error(
          errorMessages[body.error || ''] ||
            (response.status === 401
              ? 'Oturum süresi doldu. Yeniden giriş yapın.'
              : body.error || 'İşlem tamamlanamadı.'),
        )
      }
      return body
    },
  },
})
