export type OrderStatus = 'PENDING' | 'AWAITING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'SHIPPED' | 'DELIVERED';
export type FulfillmentStatus = 'AWAITING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type SagaState = 
  | 'ORDER_PLACED'
  | 'STOCK_RESERVED'
  | 'STOCK_RESERVATION_FAILED'
  | 'PAYMENT_SUCCESSFUL'
  | 'PAYMENT_FAILED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_CANCELLED';

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  productImage?: string;
  sellerId?: string;
  fulfillmentStatus?: FulfillmentStatus;
  unitPricePaise: number;
  quantity: number;
  subtotalPaise: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  shippingAddressJson: string;
  items: OrderItem[];
  subtotalPaise: number;
  shippingFeePaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
  currency: string;
  status: OrderStatus;
  sagaState: SagaState;
  couponCode?: string;
  paymentId?: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}
