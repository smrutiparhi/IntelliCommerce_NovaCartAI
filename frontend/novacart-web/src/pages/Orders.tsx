import React, { useState } from 'react';
import { Package, Calendar, ChevronRight, Eye } from 'lucide-react';
import { Order } from '../types/saga';
import { OrderTrackingTimeline } from '../components/OrderTrackingTimeline';

export const OrdersPage: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock list of orders for demonstration
  const mockOrders: Order[] = [
    {
      id: 'ord_101',
      orderNumber: 'NC-1723120000',
      userId: 'user-hemanth-208',
      shippingAddressJson: '{}',
      items: [
        {
          id: 'item-1',
          productId: 'prod-laptop-001',
          productName: 'MacBook Pro M3 Max (16-inch, 36GB RAM)',
          productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80',
          unitPricePaise: 24990000,
          quantity: 1,
          subtotalPaise: 24990000
        }
      ],
      subtotalPaise: 24990000,
      shippingFeePaise: 0,
      discountPaise: 2499000,
      taxPaise: 0,
      totalPaise: 22491000,
      currency: 'INR',
      status: 'CONFIRMED',
      sagaState: 'ORDER_CONFIRMED',
      idempotencyKey: 'idemp_demo_1',
      createdAt: '2026-08-08T10:30:00Z'
    },
    {
      id: 'ord_102',
      orderNumber: 'NC-1723129999',
      userId: 'user-hemanth-208',
      shippingAddressJson: '{}',
      items: [
        {
          id: 'item-2',
          productId: 'prod-headphones-002',
          productName: 'Sony WH-1000XM5 Wireless Headphones',
          productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
          unitPricePaise: 2999000,
          quantity: 1,
          subtotalPaise: 2999000
        }
      ],
      subtotalPaise: 2999000,
      shippingFeePaise: 0,
      discountPaise: 0,
      taxPaise: 0,
      totalPaise: 2999000,
      currency: 'INR',
      status: 'CANCELLED',
      sagaState: 'PAYMENT_FAILED',
      idempotencyKey: 'idemp_demo_2',
      createdAt: '2026-08-08T09:15:00Z'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">My Orders & Saga State Tracking</h1>
        <p className="text-sm text-slate-400 mt-1">Inspect real-time distributed saga state machines across microservices</p>
      </div>

      {selectedOrder && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-sky-400">Inspecting Selected Order Timeline</h2>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Close Inspector
            </button>
          </div>
          <OrderTrackingTimeline
            sagaState={selectedOrder.sagaState}
            status={selectedOrder.status}
            orderNumber={selectedOrder.orderNumber}
          />
        </div>
      )}

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-semibold text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-sky-400" /> Recent Customer Orders
          </h3>
          <span className="text-xs text-slate-400">{mockOrders.length} orders found</span>
        </div>

        <div className="divide-y divide-slate-800">
          {mockOrders.map(order => (
            <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-100">{order.orderNumber}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    order.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>Saga State: <code className="text-sky-400">{order.sagaState}</code></span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-bold text-slate-100 text-lg">₹{(order.totalPaise / 100).toLocaleString('en-IN')}</div>
                  <div className="text-xs text-slate-500">{order.items.length} items</div>
                </div>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Eye className="w-4 h-4 text-sky-400" /> Track Saga <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
