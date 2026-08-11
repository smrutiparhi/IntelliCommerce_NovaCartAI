import React, { useState } from 'react';
import { ShoppingBag, Tag, MapPin, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Order } from '../types/saga';
import { RazorpayWidget } from '../components/RazorpayWidget';
import { OrderTrackingTimeline } from '../components/OrderTrackingTimeline';

export const CheckoutPage: React.FC = () => {
  const [userId] = useState('user-hemanth-208');
  const [shippingAddress] = useState({
    line1: 'KL University Campus, Vaddeswaram',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    postalCode: '522502',
    country: 'India'
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscountPaise, setAppliedDiscountPaise] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock checkout items
  const items = [
    {
      productId: 'prod-laptop-001',
      productName: 'MacBook Pro M3 Max (16-inch, 36GB RAM)',
      productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80',
      sellerId: 'seller-apple-store',
      unitPricePaise: 24990000, // ₹2,49,900 stored as integer paise
      quantity: 1
    },
    {
      productId: 'prod-headphones-002',
      productName: 'Sony WH-1000XM5 Wireless Headphones',
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
      sellerId: 'seller-sony-india',
      unitPricePaise: 2999000, // ₹29,990 stored as integer paise
      quantity: 1
    }
  ];

  const subtotalPaise = items.reduce((acc, i) => acc + i.unitPricePaise * i.quantity, 0);
  const totalPaise = Math.max(0, subtotalPaise - appliedDiscountPaise);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const response = await fetch('/api/v1/payments/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmountPaise: subtotalPaise
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAppliedDiscountPaise(data.discountPaise);
        setCouponMessage(`Applied ${data.code}! Saved ₹${(data.discountPaise / 100).toLocaleString()}`);
      } else {
        // Fallback local coupon calculation if payment service mock offline
        if (couponCode.toUpperCase() === 'SAVE10') {
          const discount = Math.round(subtotalPaise * 0.1);
          setAppliedDiscountPaise(discount);
          setCouponMessage(`Applied SAVE10! Saved ₹${(discount / 100).toLocaleString()}`);
        } else {
          setCouponMessage('Invalid coupon code');
        }
      }
    } catch {
      if (couponCode.toUpperCase() === 'SAVE10') {
        const discount = Math.round(subtotalPaise * 0.1);
        setAppliedDiscountPaise(discount);
        setCouponMessage(`Applied SAVE10! Saved ₹${(discount / 100).toLocaleString()}`);
      } else {
        setCouponMessage('Invalid coupon code');
      }
    }
  };

  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    const idempotencyKey = 'idemp_' + Date.now();

    const orderPayload = {
      userId,
      items: items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        productImage: i.productImage,
        sellerId: i.sellerId,
        unitPricePaise: i.unitPricePaise,
        quantity: i.quantity
      })),
      shippingAddressJson: JSON.stringify(shippingAddress),
      couponCode: couponCode || undefined,
      idempotencyKey
    };

    try {
      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const orderData = await response.json();
        setCreatedOrder(orderData);
      } else {
        // Local simulation fallback
        const mockOrder: Order = {
          id: 'ord_' + Math.random().toString(36).substring(2, 9),
          orderNumber: 'NC-' + Date.now(),
          userId,
          shippingAddressJson: JSON.stringify(shippingAddress),
          items: items.map(i => ({ ...i, id: 'item_' + Math.random(), subtotalPaise: i.unitPricePaise * i.quantity })),
          subtotalPaise,
          shippingFeePaise: 0,
          discountPaise: appliedDiscountPaise,
          taxPaise: 0,
          totalPaise,
          currency: 'INR',
          status: 'PENDING',
          sagaState: 'ORDER_PLACED',
          idempotencyKey,
          createdAt: new Date().toISOString()
        };
        setCreatedOrder(mockOrder);
      }
    } catch {
      const mockOrder: Order = {
        id: 'ord_' + Math.random().toString(36).substring(2, 9),
        orderNumber: 'NC-' + Date.now(),
        userId,
        shippingAddressJson: JSON.stringify(shippingAddress),
        items: items.map(i => ({ ...i, id: 'item_' + Math.random(), subtotalPaise: i.unitPricePaise * i.quantity })),
        subtotalPaise,
        shippingFeePaise: 0,
        discountPaise: appliedDiscountPaise,
        taxPaise: 0,
        totalPaise,
        currency: 'INR',
        status: 'PENDING',
        sagaState: 'ORDER_PLACED',
        idempotencyKey,
        createdAt: new Date().toISOString()
      };
      setCreatedOrder(mockOrder);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    if (createdOrder) {
      setCreatedOrder({
        ...createdOrder,
        status: 'CONFIRMED',
        sagaState: 'ORDER_CONFIRMED',
        paymentId
      });
    }
  };

  const handlePaymentFailure = (reason: string) => {
    if (createdOrder) {
      setCreatedOrder({
        ...createdOrder,
        status: 'CANCELLED',
        sagaState: 'PAYMENT_FAILED'
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Checkout</h1>
          <p className="text-sm text-slate-400 mt-1">Slice 3: Transactions & Kafka Saga Choreography</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-sky-400 bg-sky-950/60 px-3 py-1.5 rounded-full border border-sky-900">
          <ShieldCheck className="w-4 h-4" /> Atomic Outbox + Inbox Idempotency Protected
        </div>
      </div>

      {!createdOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Cart items */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-sky-400" /> Cart Summary ({items.length} items)
              </h3>
              <div className="divide-y divide-slate-800">
                {items.map(item => (
                  <div key={item.productId} className="py-4 flex gap-4 items-center">
                    <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-xl object-cover border border-slate-800" />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-200 text-sm">{item.productName}</h4>
                      <span className="text-xs text-slate-400">Seller: {item.sellerId}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-100">₹{(item.unitPricePaise / 100).toLocaleString('en-IN')}</div>
                      <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-sky-400" /> Delivery Address
              </h3>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300">
                <div className="font-semibold text-slate-100">N Hemanth Babu</div>
                <div>{shippingAddress.line1}</div>
                <div>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</div>
                <div className="text-xs text-slate-500 mt-1">{shippingAddress.country}</div>
              </div>
            </div>
          </div>

          {/* Order Summary sidebar */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-semibold text-lg text-slate-100">Price Details</h3>
              
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{(subtotalPaise / 100).toLocaleString('en-IN')}</span>
                </div>
                {appliedDiscountPaise > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-₹{(appliedDiscountPaise / 100).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Currency Storage</span>
                  <span className="font-mono text-sky-400">Paise (Integer)</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between font-bold text-lg text-slate-100">
                  <span>Total</span>
                  <span className="text-sky-400">₹{(totalPaise / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Coupon input */}
              <div className="pt-4 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Tag className="w-3.5 h-3.5" /> Apply Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Try SAVE10"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold text-xs rounded-xl transition-all border border-slate-700"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className="text-xs text-emerald-400 mt-2 font-medium">{couponMessage}</p>
                )}
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={isSubmitting}
                className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Place Order & Trigger Saga <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <OrderTrackingTimeline
            sagaState={createdOrder.sagaState}
            status={createdOrder.status}
            orderNumber={createdOrder.orderNumber}
          />

          {createdOrder.status !== 'CONFIRMED' && createdOrder.status !== 'CANCELLED' && (
            <div className="max-w-2xl mx-auto">
              <RazorpayWidget
                order={createdOrder}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
