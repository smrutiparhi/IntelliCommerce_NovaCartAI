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
  const response = await apiClient.get<InventoryRecord[]>('/inventory')
  return response.data
}

export async function setInventory(productId: string, availableQuantity: number, sellerId?: string): Promise<InventoryRecord> {
  const response = await apiClient.post<InventoryRecord>('/inventory', {
    productId,
    sellerId,
    availableQuantity,
    reservedQuantity: 0,
    lowStockThreshold: 5,
  })
  return response.data
}
