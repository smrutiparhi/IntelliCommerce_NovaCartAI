import { apiClient } from '../lib/api-client'
import type { DeliveryAddress } from '../stores/checkout-store'
import type { Order } from '../types/saga'

export interface CreateOrderPayload {
  userId: string
  items: Array<{ productId: string; productName: string; productImage?: string; sellerId?: string; unitPricePaise: number; quantity: number }>
  shippingAddressJson: string
  couponCode?: string
  idempotencyKey: string
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await apiClient.post<Order>('/orders', payload)
  return response.data
}

export async function getOrder(orderId: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${encodeURIComponent(orderId)}`)
  return response.data
}

export async function getOrders(page = 0, size = 20) {
  const response = await apiClient.get<{ content: Order[]; totalElements: number; totalPages: number }>('/orders', { params: { page, size } })
  return response.data
}

export async function getSellerOrders(page = 0, size = 20) {
  const response = await apiClient.get<{ content: Order[]; totalElements: number; totalPages: number }>('/orders/seller', { params: { page, size } })
  return response.data
}

export async function cancelOrder(orderId: string, reason = 'User requested cancellation'): Promise<Order> {
  const response = await apiClient.post<Order>(`/orders/${encodeURIComponent(orderId)}/cancel`, undefined, { params: { reason } })
  return response.data
}

export const serializeAddress = (address: DeliveryAddress) => JSON.stringify(address)
