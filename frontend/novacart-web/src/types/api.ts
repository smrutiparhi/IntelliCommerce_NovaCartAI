export interface ApiMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: ApiMeta
  timestamp: string
  traceId: string
}

export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    type: string
    fieldErrors?: ApiFieldError[]
  }
  timestamp: string
  traceId: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PageResponse<T> {
  content: T[]
  meta: ApiMeta
}
