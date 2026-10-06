import { defineStore } from 'pinia'

import type { AdminState, ServiceRequest } from './types'

const sessionKey = 'enteksis-admin-authorization'
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

interface ErrorBody {
  error?: string
}

function basicAuthorization(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `Basic ${window.btoa(binary)}`
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    authorization: window.sessionStorage.getItem(sessionKey) || '',
    requests: [],
    currentRequest: null,
    listState: 'idle',
    detailState: 'idle',
    error: '',
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.authorization),
  },
  actions: {
    async login(username: string, password: string): Promise<boolean> {
      this.authorization = basicAuthorization(username.trim(), password)
      window.sessionStorage.setItem(sessionKey, this.authorization)
      const authenticated = await this.loadRequests()
      if (!authenticated) {
        const message = this.error
        this.logout()
        this.error = message
      }
      return authenticated
    },
    logout() {
      this.authorization = ''
      this.requests = []
      this.currentRequest = null
      this.listState = 'idle'
      this.detailState = 'idle'
      this.error = ''
      window.sessionStorage.removeItem(sessionKey)
    },
    async loadRequests(): Promise<boolean> {
      this.listState = 'loading'
      this.error = ''
      try {
        const response = await this.adminFetch<{ items: ServiceRequest[] }>('/api/v1/admin/requests')
        this.requests = response.items
        this.listState = 'ready'
        return true
      } catch (error) {
        this.listState = 'error'
        this.error = error instanceof Error ? error.message : 'Talepler yüklenemedi.'
        return false
      }
    },
    async loadRequest(id: string): Promise<boolean> {
      this.detailState = 'loading'
      this.currentRequest = null
      this.error = ''
      try {
        this.currentRequest = await this.adminFetch<ServiceRequest>(
          `/api/v1/admin/requests/${encodeURIComponent(id)}`,
        )
        this.detailState = 'ready'
        return true
      } catch (error) {
        this.detailState = 'error'
        this.error = error instanceof Error ? error.message : 'Talep yüklenemedi.'
        return false
      }
    },
    async adminFetch<T>(path: string): Promise<T> {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        headers: { Authorization: this.authorization },
      })
      const body = (await response.json().catch(() => ({}))) as T & ErrorBody
      if (!response.ok) {
        if (response.status === 401) {
          this.authorization = ''
          window.sessionStorage.removeItem(sessionKey)
        }
        throw new Error(body.error || 'İstek tamamlanamadı.')
      }
      return body
    },
  },
})

export type { AdminState, RequestState, ServiceRequest } from './types'
