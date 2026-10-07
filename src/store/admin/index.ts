import { defineStore } from 'pinia'

import type { AdminState, RequestStatus, ServiceRequest } from './types'

export const adminSessionKey = 'ent-challange-admin-authorization'
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
    authorization: window.sessionStorage.getItem(adminSessionKey) || '',
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
      window.sessionStorage.setItem(adminSessionKey, this.authorization)
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
      window.sessionStorage.removeItem(adminSessionKey)
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
    async updateRequestStatus(id: string, status: RequestStatus): Promise<ServiceRequest> {
      const updated = await this.adminFetch<ServiceRequest>(
        `/api/v1/admin/requests/${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        },
      )
      this.currentRequest = updated
      const index = this.requests.findIndex((request) => request.id === id)
      if (index !== -1) this.requests[index] = updated
      return updated
    },
    async deleteRequest(id: string): Promise<void> {
      await this.adminFetch(`/api/v1/admin/requests/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      this.requests = this.requests.filter((request) => request.id !== id)
      if (this.currentRequest?.id === id) this.currentRequest = null
    },
    async adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
      const headers = new Headers(init.headers)
      headers.set('Authorization', this.authorization)
      const response = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        headers,
      })
      const body = (await response.json().catch(() => ({}))) as T & ErrorBody
      if (!response.ok) {
        if (response.status === 401) {
          this.authorization = ''
          window.sessionStorage.removeItem(adminSessionKey)
        }
        throw new Error(body.error || 'İstek tamamlanamadı.')
      }
      return body
    },
  },
})

export type { AdminState, RequestState, RequestStatus, ServiceRequest } from './types'
