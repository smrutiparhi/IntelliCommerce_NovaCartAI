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

export interface RazorpayConfig {
  keyId: string
  live: boolean
}

export interface CouponQuote {
  code: string
  discountPaise: number
  finalAmountPaise: number
}

export async function applyCoupon(code: string, orderAmountPaise: number): Promise<CouponQuote> {
  const response = await apiClient.post<CouponQuote>('/payments/coupons/apply', { code, orderAmountPaise })
  return response.data
}

export async function getRazorpayConfig(): Promise<RazorpayConfig> {
  const response = await apiClient.get<RazorpayConfig>('/payments/config')
  return response.data
}

export async function processPayment(orderId: string, userId: string, amountPaise: number, payment?: { paymentId?: string; signature?: string }): Promise<Payment> {
  const response = await apiClient.post<Payment>('/payments/process', {
    orderId,
    userId,
    amountPaise,
    shouldFail: false,
    razorpayPaymentId: payment?.paymentId,
    razorpaySignature: payment?.signature,
  })
  return response.data
}

export async function getPayment(orderId: string): Promise<Payment> {
  const response = await apiClient.get<Payment>(`/payments/order/${encodeURIComponent(orderId)}`)
  return response.data
}
