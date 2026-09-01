import React, { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { Order } from '../types/saga';

interface RazorpayWidgetProps {
  order: Order;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentFailure: (reason: string) => void;
}

export const RazorpayWidget: React.FC<RazorpayWidgetProps> = ({
  order,
  onPaymentSuccess,
  onPaymentFailure
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          userId: order.userId,
          amountPaise: order.totalPaise,
          shouldFail: false
        })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.status === 'CAPTURED') {
        onPaymentSuccess(data.id);
      } else {
        onPaymentFailure(data.failureReason || 'Payment Declined by Razorpay');
      }
    } catch {
      setLoading(false);
      onPaymentFailure('Network connection error');
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-sky-500/20 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">Razorpay Payment Gateway</h3>
            <p className="text-xs text-slate-400">Server-side HMAC SHA256 Signature Verification</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <Lock className="w-3.5 h-3.5" /> 256-bit Encrypted
        </div>
      </div>

      <div className="my-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
        <div>
          <span className="text-xs text-slate-400">Total Payable Amount</span>
          <div className="text-2xl font-bold text-slate-100">
            ₹{(order.totalPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Currency Storage</span>
          <div className="text-xs font-mono text-sky-400 bg-sky-950/60 px-2 py-1 rounded border border-sky-900 mt-1">
            {order.totalPaise} paise (integer)
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" /> Pay securely
            </>
          )}
        </button>

      </div>

      <div className="mt-4 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Test Mode active. Webhooks signature verified server-side.
      </div>
    </div>
  );
};
