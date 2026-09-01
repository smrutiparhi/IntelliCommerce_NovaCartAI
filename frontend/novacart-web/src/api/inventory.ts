import { apiClient } from '../lib/api-client'

export interface InventoryRecord {
  id?: string
  productId: string
  sellerId?: string
  availableQuantity: number
  reservedQuantity: number
  lowStockThreshold: number
}

export async function getInventory(): Promise<InventoryRecord[]> {
  const response = await apiClient.get<InventoryRecord[]>('/inventory/seller/me')
  return response.data
}

export async function getAvailability(): Promise<Record<string, number>> {
  return (await apiClient.get<Record<string, number>>('/inventory/availability')).data
}

export async function getProductInventory(productId: string): Promise<InventoryRecord | null> {
  try { return (await apiClient.get<InventoryRecord>(`/inventory/product/${encodeURIComponent(productId)}`)).data }
  catch { return null }
}

export async function setInventory(productId: string, availableQuantity: number): Promise<InventoryRecord> {
  const response = await apiClient.post<InventoryRecord>('/inventory', {
    productId,
    availableQuantity,
    reservedQuantity: 0,
    lowStockThreshold: 5,
  })
  return response.data
}
