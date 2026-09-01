import { apiClient } from '../lib/api-client'

export interface Payment {
  id: string
  orderId: string
  razorpayOrderId: string
  razorpayPaymentId?: string
  amountPaise: number
  currency: string
  status: 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED'
  failureReason?: string
}

export async function processPayment(orderId: string, userId: string, amountPaise: number): Promise<Payment> {
  const response = await apiClient.post<Payment>('/payments/process', {
    orderId,
    userId,
    amountPaise,
    shouldFail: false,
  })
  return response.data
}

export async function getPayment(orderId: string): Promise<Payment> {
  const response = await apiClient.get<Payment>(`/payments/order/${encodeURIComponent(orderId)}`)
  return response.data
}
