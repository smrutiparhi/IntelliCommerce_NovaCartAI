import { beforeEach, describe, expect, it } from 'vitest'
import { useCheckoutStore } from './checkout-store'
import type { Order } from '../types/saga'

const order: Order = {
  id: 'order-1', orderNumber: 'NC-1', userId: 'user-1', shippingAddressJson: '{}', items: [],
  subtotalPaise: 10000, shippingFeePaise: 0, discountPaise: 0, taxPaise: 0, totalPaise: 10000,
  currency: 'INR', status: 'PENDING', sagaState: 'ORDER_PLACED', idempotencyKey: 'key-1', createdAt: new Date(0).toISOString(),
}

describe('checkout store', () => {
  beforeEach(() => useCheckoutStore.getState().clearCheckout())

  it('keeps the delivery address but clears transient order data after checkout', () => {
    const address = { fullName: 'Smruti Parhi', phone: '9999999999', line1: 'Test Road', city: 'Bhubaneswar', state: 'Odisha', postalCode: '751001' }
    useCheckoutStore.getState().setAddress(address)
    useCheckoutStore.getState().setIdempotencyKey('key-1', 'product-1:1:999')
    useCheckoutStore.getState().setActiveOrder(order)

    useCheckoutStore.getState().finishCheckout()

    expect(useCheckoutStore.getState().address).toEqual(address)
    expect(useCheckoutStore.getState().activeOrder).toBeNull()
    expect(useCheckoutStore.getState().idempotencyKey).toBeNull()
  })
})
