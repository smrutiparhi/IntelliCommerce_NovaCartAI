import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order } from '../types/saga'

export interface DeliveryAddress {
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
}

interface CheckoutState {
  address: DeliveryAddress | null
  idempotencyKey: string | null
  activeOrder: Order | null
  setAddress: (address: DeliveryAddress) => void
  setIdempotencyKey: (key: string) => void
  setActiveOrder: (order: Order) => void
  finishCheckout: () => void
  clearCheckout: () => void
}

export const useCheckoutStore = create<CheckoutState>()(persist(
  (set) => ({
    address: null,
    idempotencyKey: null,
    activeOrder: null,
    setAddress: (address) => set({ address }),
    setIdempotencyKey: (idempotencyKey) => set({ idempotencyKey }),
    setActiveOrder: (activeOrder) => set({ activeOrder }),
    finishCheckout: () => set({ idempotencyKey: null, activeOrder: null }),
    clearCheckout: () => set({ address: null, idempotencyKey: null, activeOrder: null }),
  }),
  { name: 'novacart-checkout' },
))
