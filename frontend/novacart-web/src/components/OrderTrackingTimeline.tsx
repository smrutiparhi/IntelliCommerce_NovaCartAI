import React from 'react';
import { SagaState, OrderStatus } from '../types/saga';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck, CreditCard, PackageCheck } from 'lucide-react';

interface OrderTrackingTimelineProps {
  sagaState: SagaState;
  status: OrderStatus;
  orderNumber: string;
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  sagaState,
  status,
  orderNumber
}) => {
  const isFailed = status === 'CANCELLED' || sagaState === 'PAYMENT_FAILED' || sagaState === 'STOCK_RESERVATION_FAILED' || sagaState === 'ORDER_CANCELLED';

  const steps = [
    {
      id: 'ORDER_PLACED',
      label: 'Order Placed',
      description: 'Order written atomically to DB + Outbox',
      icon: PackageCheck,
      completed: true, // Always true if order exists
      failed: false
    },
    {
      id: 'STOCK_RESERVED',
      label: 'Inventory Reservation',
      description: sagaState === 'STOCK_RESERVATION_FAILED' 
        ? 'Stock reservation failed (out of stock)'
        : '15-min TTL reservation active on inventory_db',
      icon: ShieldCheck,
      completed: ['STOCK_RESERVED', 'PAYMENT_SUCCESSFUL', 'ORDER_CONFIRMED'].includes(sagaState),
      failed: sagaState === 'STOCK_RESERVATION_FAILED'
    },
    {
      id: 'PAYMENT_SUCCESSFUL',
      label: 'Payment Processing',
      description: sagaState === 'PAYMENT_FAILED'
        ? 'Payment failed — Triggered Saga Compensation & Stock Release'
        : 'HMAC SHA256 signature verified server-side',
      icon: CreditCard,
      completed: ['PAYMENT_SUCCESSFUL', 'ORDER_CONFIRMED'].includes(sagaState),
      failed: sagaState === 'PAYMENT_FAILED'
    },
    {
      id: 'ORDER_CONFIRMED',
      label: 'Final Confirmation',
      description: isFailed ? 'Order Cancelled' : 'Saga transaction complete & notification logged',
      icon: CheckCircle2,
      completed: sagaState === 'ORDER_CONFIRMED',
      failed: isFailed
    }
  ];

  return (
    <div className="w-full glass-card p-6 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold">Saga State Machine</span>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-1">
            Order #{orderNumber}
          </h3>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
          status === 'CONFIRMED' 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : isFailed 
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {status === 'CONFIRMED' && <CheckCircle2 className="w-4 h-4" />}
          {isFailed && <XCircle className="w-4 h-4" />}
          {status !== 'CONFIRMED' && !isFailed && <Clock className="w-4 h-4 animate-spin" />}
          {status} ({sagaState})
        </div>
      </div>

      <div className="mt-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            let iconBg = 'bg-slate-800 text-slate-400 border-slate-700';
            if (step.failed) {
              iconBg = 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-lg shadow-rose-500/10';
            } else if (step.completed) {
              iconBg = 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-lg shadow-sky-500/10';
            }

            return (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${iconBg}`}>
                  {step.failed ? <AlertTriangle className="w-7 h-7" /> : <Icon className="w-7 h-7" />}
                </div>
                <h4 className="font-semibold text-slate-200 mt-3 text-sm">{step.label}</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[180px]">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {isFailed && (
        <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-900/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-300">
            <span className="font-semibold text-rose-200 block mb-0.5">Saga Compensation Executed</span>
            The payment or stock reservation failed. Kafka compensation messages naturally routed to release reserved stock in <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-300">inventory_db</code> and update order status to <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-300">CANCELLED</code>.
          </div>
        </div>
      )}
    </div>
  );
};
