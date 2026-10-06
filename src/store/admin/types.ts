export interface ServiceRequest {
  id: string
  name: string
  email: string
  serviceType: string
  description: string
  createdAt: string
}

export type RequestState = 'idle' | 'loading' | 'ready' | 'error'

export interface AdminState {
  authorization: string
  requests: ServiceRequest[]
  currentRequest: ServiceRequest | null
  listState: RequestState
  detailState: RequestState
  error: string
}
