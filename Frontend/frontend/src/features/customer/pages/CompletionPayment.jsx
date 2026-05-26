import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchRequestDetailApi,
  createPaymentOrderApi,
  verifyPaymentApi,
  confirmCashPaidApi,
  confirmWorkCompletionApi,
} from '../services/customerAPI';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_xxxxxxxxxxxxxxx';

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CompletionPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [work, setWork]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying]   = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchRequestDetailApi(id);
      setWork(res.data?.data || res.data);
    } catch {
      toast.error('Failed to load work details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Razorpay online payment ─────────────────────────────────────
  const handleOnlinePayment = async () => {
    setPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Razorpay failed to load'); return; }

      const { data } = await createPaymentOrderApi(id);
      const orderData = data?.data || data;

      const options = {
        key:         orderData.key || RAZORPAY_KEY,
        amount:      orderData.amount,     // in paise
        currency:    orderData.currency || 'INR',
        name:        'LoadLink',
        description: work?.title || 'Labor Services',
        order_id:    orderData.order_id || orderData.razorpay_order_id,
        prefill: {
          name:  work?.customer?.full_name  || '',
          email: work?.customer?.email      || '',
          contact: work?.customer?.phone_number || '',
        },
        theme: { color: '#2563eb' },
        handler: async (response) => {
          try {
            await verifyPaymentApi({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              work_request_id:     id,
            });
            toast.success('Payment successful! 🎉');
            await load();
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => toast('Payment cancelled', { icon: 'ℹ️' }),
        },
      };

      new window.Razorpay(options).open();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setPaying(false);
    }
  };

  // ── Cash payment confirmation ───────────────────────────────────
  const handleCashPaid = async () => {
    setConfirming(true);
    try {
      await confirmCashPaidApi(id);
      toast.success('Cash payment confirmed!');
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to confirm cash payment');
    } finally {
      setConfirming(false);
    }
  };

  // ── Confirm work completion ─────────────────────────────────────
  const handleConfirmCompletion = async () => {
    setConfirming(true);
    try {
      await confirmWorkCompletionApi(id);
      toast.success('Work confirmed as complete!');
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to confirm completion');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!work) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-slate-600">Work not found.</p>
      <button onClick={() => navigate('/customer/quotes')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg">Back to Quotes</button>
    </div>
  );

  const payment  = work.payment;
  const parsedFinal = parseFloat(work.final_price || 0);
  const parsedEstimated = parseFloat(work.estimated_price || 0);
  const amount = parsedFinal > 0 ? parsedFinal : parsedEstimated;
  const isPaid   = payment?.payment_status === 'paid' || payment?.payment_status === 'success';
  const isOnline = payment?.payment_method === 'online';
  const isCash   = payment?.payment_method === 'cash';
  const bothConfirmed = payment?.customer_payment_confirmed && payment?.worker_payment_confirmed;

  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,sans-serif] pb-10">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3" style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>
          <button onClick={() => navigate('/customer/quotes')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-slate-900">Payment</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-5" style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Amount card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center shadow-lg">
          <p className="text-blue-100 text-sm mb-1">Amount Due</p>
          <p className="text-5xl font-black">₹{amount.toFixed(0)}</p>
          <p className="text-blue-200 text-xs mt-2">{work.title}</p>
          {payment && (
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold
              ${isPaid ? 'bg-emerald-400 text-emerald-900' : 'bg-white/20 text-white'}`}>
              {isPaid ? '✓ Paid' : 'Pending'}
            </span>
          )}
        </div>

        {/* Work summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-bold text-slate-900 mb-3">Work Summary</h2>
          {[
            { icon:'location_on',    label:'Location', value: work.work_address || work.district },
            { icon:'calendar_today', label:'Date',     value: work.scheduled_date },
            { icon:'group',          label:'Workers',  value: work.estimated_workers },
            { icon:'timer',          label:'Duration', value: work.estimated_duration_hours ? `${work.estimated_duration_hours}h` : '—' },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-500 text-[18px]">{r.icon}</span>
              <span className="text-sm text-slate-500 w-24">{r.label}</span>
              <span className="text-sm font-semibold text-slate-800">{r.value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Confirm work completion — if work_completion_pending */}
        {work.status === 'work_completion_pending' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-emerald-600 text-2xl"
                style={{ fontVariationSettings:"'FILL' 1" }}>task_alt</span>
              <div>
                <p className="font-bold text-slate-900">Work Completed?</p>
                <p className="text-xs text-slate-500">The team has marked the work as done. Please confirm if satisfied.</p>
              </div>
            </div>
            <button onClick={handleConfirmCompletion} disabled={confirming}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {confirming
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <span className="material-symbols-outlined text-[18px]">check_circle</span>}
              Yes, Confirm Completion
            </button>
          </div>
        )}

        {/* Payment actions — if payment_pending */}
        {work.status === 'payment_pending' && !isPaid && (
          <div className="space-y-3">
            {/* Online */}
            <button onClick={handleOnlinePayment} disabled={paying}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-3 shadow-md">
              {paying
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <span className="material-symbols-outlined text-[22px]">credit_card</span>}
              Pay Online with Razorpay
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Cash */}
            <button onClick={handleCashPaid} disabled={confirming || payment?.customer_payment_confirmed}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 border-2
                ${payment?.customer_payment_confirmed
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60'}`}>
              {payment?.customer_payment_confirmed
                ? <><span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings:"'FILL' 1" }}>check_circle</span>Cash Payment Confirmed</>
                : <><span className="material-symbols-outlined text-[22px]">payments</span>Confirm Cash Payment</>}
            </button>
          </div>
        )}

        {/* Cash status tracker */}
        {isCash && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-3">Cash Payment Status</h3>
            {[
              { label:'Customer Confirmed', done: payment?.customer_payment_confirmed },
              { label:'Worker Confirmed',   done: payment?.worker_payment_confirmed },
            ].map(step => (
              <div key={step.label} className={`flex items-center gap-3 p-3 rounded-lg border mb-2
                ${step.done ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`material-symbols-outlined text-[20px]
                  ${step.done ? 'text-emerald-600' : 'text-slate-300'}`}
                  style={{ fontVariationSettings:"'FILL' 1" }}>
                  {step.done ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className={`text-sm font-medium ${step.done ? 'text-emerald-800' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Paid success */}
        {isPaid && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-5xl text-emerald-600 mb-2 block"
              style={{ fontVariationSettings:"'FILL' 1" }}>task_alt</span>
            <p className="text-xl font-black text-emerald-900">Payment Complete!</p>
            <p className="text-emerald-700 text-sm mt-1">Thank you for using LoadLink.</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => navigate(`/customer/review/${id}`)}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600">
                Rate Workers
              </button>
              <button onClick={() => navigate('/customer/history')}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50">
                View History
              </button>
            </div>
          </div>
        )}

        {/* Dispute button */}
        <button onClick={() => navigate(`/customer/dispute/${id}`)}
          className="w-full py-3 border border-red-200 text-red-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-red-50">
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          Report a Dispute
        </button>
      </div>
    </div>
  );
}
