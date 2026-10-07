export type RequestStatus = 'new' | 'read' | 'replied'

export interface ServiceRequest {
  id: string
  name: string
  email: string
  serviceType: string
  description: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
  repliedAt: string | null
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
