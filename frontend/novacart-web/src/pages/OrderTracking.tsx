import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { OrderTrackingTimeline } from '../components/OrderTrackingTimeline';
import { RazorpayWidget } from '../components/RazorpayWidget';
import { Order } from '../types/saga';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    setLoading(true);
    setTimeout(() => {
      setOrder({
        id: id || 'ord_demo',
        orderNumber: 'NC-' + Date.now().toString().substring(3),
        userId: 'user-hemanth-208',
        shippingAddressJson: '{}',
        items: [],
        subtotalPaise: 5000000,
        shippingFeePaise: 0,
        discountPaise: 0,
        taxPaise: 0,
        totalPaise: 5000000,
        currency: 'INR',
        status: 'PENDING',
        sagaState: 'ORDER_PLACED',
        idempotencyKey: 'idemp_' + id,
        createdAt: new Date().toISOString()
      });
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-sky-500" />
        <p>Loading saga state...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Order not found
      </div>
    );
  }

  const handlePaymentSuccess = (paymentId: string) => {
    setOrder({
      ...order,
      status: 'CONFIRMED',
      sagaState: 'ORDER_CONFIRMED',
      paymentId
    });
  };

  const handlePaymentFailure = (reason: string) => {
    setOrder({
      ...order,
      status: 'CANCELLED',
      sagaState: 'PAYMENT_FAILED'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
        <Link to="/orders" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Order Tracking</h1>
          <p className="text-sm text-slate-400 mt-1">Saga execution inspector</p>
        </div>
      </div>

      <OrderTrackingTimeline
        sagaState={order.sagaState}
        status={order.status}
        orderNumber={order.orderNumber}
      />

      {order.status !== 'CONFIRMED' && order.status !== 'CANCELLED' && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Complete Payment</h2>
          <RazorpayWidget
            order={order}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailure={handlePaymentFailure}
          />
        </div>
      )}
    </div>
  );
};
