import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchRequests } from '../slice/customerSlice';
import useNotificationSocket from '../../../hooks/useNotificationSocket';

const ALL_STATUSES = [
  'pending','created','union_review','team_suggested','team_confirmed',
  'workers_assigned','workers_on_the_way','workers_arrived',
  'in_progress','work_completion_pending','payment_pending',
  'completed','cancelled','disputed',
];

const STATUS_CONFIG = {
  created:                    { label:'Submitted',          color:'text-blue-700',   bg:'bg-blue-50',    icon:'assignment' },
  pending:                    { label:'Pending Review',     color:'text-amber-700',  bg:'bg-amber-50',   icon:'hourglass_empty' },
  union_review:               { label:'Union Review',       color:'text-purple-700', bg:'bg-purple-50',  icon:'rate_review' },
  team_suggested:             { label:'Team Suggested',     color:'text-teal-700',   bg:'bg-teal-50',    icon:'groups' },
  team_confirmed:             { label:'Team Confirmed',     color:'text-teal-700',   bg:'bg-teal-50',    icon:'verified' },
  workers_assigned:           { label:'Workers Ready',      color:'text-blue-700',   bg:'bg-blue-50',    icon:'badge' },
  workers_on_the_way:         { label:'On The Way',         color:'text-blue-700',   bg:'bg-blue-50',    icon:'directions_car' },
  workers_arrived:            { label:'Workers Arrived',    color:'text-green-700',  bg:'bg-green-50',   icon:'location_on' },
  in_progress:                { label:'In Progress',        color:'text-green-700',  bg:'bg-green-50',   icon:'construction' },
  work_completion_pending:    { label:'Completion Pending', color:'text-orange-700', bg:'bg-orange-50',  icon:'pending' },
  payment_pending:            { label:'Payment Pending',    color:'text-orange-700', bg:'bg-orange-50',  icon:'payments' },
  completed:                  { label:'Completed',          color:'text-emerald-700',bg:'bg-emerald-50', icon:'task_alt' },
  cancelled:                  { label:'Cancelled',          color:'text-red-700',    bg:'bg-red-50',     icon:'cancel' },
  disputed:                   { label:'Disputed',           color:'text-red-700',    bg:'bg-red-50',     icon:'gavel' },
};

const WORK_LABELS = {
  shop_unloading:'Shop / Textile Unloading', market_loading:'Vegetable Market Loading',
  household_shifting:'Household Shifting', construction:'Construction Material',
  warehouse:'Wholesale / Warehouse', other:'Other Labor',
};

const PRIORITY_CONFIG = {
  high:   { label:'High',   color:'text-red-600',    bg:'bg-red-50' },
  medium: { label:'Medium', color:'text-amber-600',  bg:'bg-amber-50' },
  low:    { label:'Low',    color:'text-green-600',  bg:'bg-green-50' },
};

// ── Popup toast component ──────────────────────────────────────────
function TeamConfirmedPopup({ req, onClose, onTrack }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full border-2 border-emerald-200" style={{ maxWidth: '400px', boxSizing: 'border-box' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-emerald-600"
              style={{ fontVariationSettings:"'FILL' 1" }}>groups</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Team Confirmed! 🎉</h2>
          <p className="text-slate-600 text-sm">
            Your team has been assigned for <strong>{WORK_LABELS[req?.work_type] || req?.work_type}</strong>.
            They're getting ready!
          </p>
          <div className="flex gap-3 w-full mt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">
              Dismiss
            </button>
            <button onClick={onTrack}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700">
              Track Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewQuotesPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { requests, loading } = useSelector((s) => s.customer);

  const [popup, setPopup] = useState(null); // { work_request_id, work_type, ... }
  const [activeTab, setActiveTab] = useState('active');

  // Fetch on mount
  useEffect(() => { dispatch(fetchRequests()); }, [dispatch]);

  // ── WS: listen for team_confirmed and status updates ─────────────
  const handleWsMessage = useCallback((event) => {
    if (event.type === 'team_confirmed') {
      setPopup(event.data);
      dispatch(fetchRequests()); // refresh list
      toast.success(event.title || 'Your team is confirmed!', { duration: 4000 });
    } else if (event.type === 'work_status_update') {
      dispatch(fetchRequests());
      toast(event.title || 'Work status updated', { icon: '🔔' });
    }
  }, [dispatch]);

  useNotificationSocket(handleWsMessage);

  // ── Tabs ──────────────────────────────────────────────────────────
  const activeReqs    = requests.filter(r => !['completed','cancelled'].includes(r.status));
  const completedReqs = requests.filter(r => r.status === 'completed');
  const cancelledReqs = requests.filter(r => r.status === 'cancelled');

  const tabData = activeTab === 'active'    ? activeReqs
                : activeTab === 'completed' ? completedReqs
                : cancelledReqs;

  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,sans-serif]">
      {/* Team Confirmed Popup */}
      {popup && (
        <TeamConfirmedPopup
          req={popup}
          onClose={() => setPopup(null)}
          onTrack={() => { navigate(`/customer/track/${popup.work_request_id}`); setPopup(null); }}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/customer/dashboard')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">My Requests</h1>
            <p className="text-xs text-slate-500">{requests.length} total</p>
          </div>
          <button onClick={() => dispatch(fetchRequests())}
            className="ml-auto w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <span className={`material-symbols-outlined text-[20px] text-slate-500 ${loading ? 'animate-spin' : ''}`}>refresh</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 pb-0">
          {[
            { key:'active',    label:'Active',    count: activeReqs.length },
            { key:'completed', label:'Completed', count: completedReqs.length },
            { key:'cancelled', label:'Cancelled', count: cancelledReqs.length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5
                ${activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {tab.label}
              {tab.count > 0 && (
                <span className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1
                  ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-5 flex flex-col gap-4">

        {/* Loading skeletons */}
        {loading && tabData.length === 0 && (
          <div className="flex flex-col gap-4">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border border-slate-200 h-48 animate-pulse" />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && tabData.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">receipt_long</span>
            <p className="text-lg font-bold text-slate-700">No {activeTab} requests</p>
            {activeTab === 'active' && (
              <button onClick={() => navigate('/customer/booking/category')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span>New Request
              </button>
            )}
          </div>
        )}

        {/* Request cards */}
        {tabData.map((req) => {
          const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.created;
          const pri = PRIORITY_CONFIG[req.priority] || PRIORITY_CONFIG.medium;
          const price = req.estimated_price ? parseFloat(req.estimated_price) : null;

          const isTeamReady    = ['team_confirmed','workers_assigned','workers_on_the_way','workers_arrived','in_progress'].includes(req.status);
          const isPaymentDue   = req.status === 'payment_pending';
          const isCompletionDue= req.status === 'work_completion_pending';
          const isDone         = req.status === 'completed';
          const canDispute     = ['in_progress','work_completion_pending','payment_pending','completed'].includes(req.status);

          return (
            <div key={req.request_id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

              {/* Card header */}
              <div className={`px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3
                ${isTeamReady ? 'bg-emerald-50' : isDone ? 'bg-slate-50' : 'bg-white'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`material-symbols-outlined text-[20px] ${cfg.color}`}
                    style={{ fontVariationSettings:"'FILL' 1" }}>{cfg.icon}</span>
                  <h3 className="font-bold text-slate-900 truncate text-sm">
                    {WORK_LABELS[req.work_type] || req.work_type?.replace(/_/g,' ')}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${pri.color} ${pri.bg}`}>{pri.label}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                {/* Meta row */}
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {req.district || req.work_address || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {req.scheduled_date || new Date(req.created_at).toLocaleDateString('en-IN')}
                  </span>
                  {req.scheduled_time && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {req.scheduled_time}
                    </span>
                  )}
                </div>

                {/* Estimates */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label:'Workers', value: req.estimated_workers ?? '—' },
                    { label:'Est. Price', value: price ? `₹${price.toFixed(0)}` : '—' },
                    { label:'Duration', value: req.estimated_duration_hours ? `${req.estimated_duration_hours}h` : '—' },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">{item.label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Union assigned */}
                {req.assigned_union && (
                  <div className="flex items-center gap-2 mb-4 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="material-symbols-outlined text-blue-600 text-[16px]">verified</span>
                    <span className="text-xs text-slate-700">
                      Assigned to <strong>{req.assigned_union?.union_name || 'Union'}</strong>
                    </span>
                  </div>
                )}

                {/* ── Action Buttons ── */}
                <div className="flex flex-wrap gap-2">

                  {/* Track */}
                  {isTeamReady && (
                    <button onClick={() => navigate(`/customer/track/${req.request_id}`)}
                      className="flex-1 min-w-[120px] py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">map</span>Track Live
                    </button>
                  )}

                  {/* Confirm completion */}
                  {isCompletionDue && (
                    <button onClick={() => navigate(`/customer/track/${req.request_id}`)}
                      className="flex-1 min-w-[120px] py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700">
                      <span className="material-symbols-outlined text-[16px]">task_alt</span>Confirm Done
                    </button>
                  )}

                  {/* Payment */}
                  {isPaymentDue && (
                    <button onClick={() => navigate(`/customer/payment/${req.request_id}`)}
                      className="flex-1 min-w-[120px] py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-orange-600">
                      <span className="material-symbols-outlined text-[16px]">payments</span>Pay Now
                    </button>
                  )}

                  {/* Review (after completed) */}
                  {isDone && (
                    <button onClick={() => navigate(`/customer/review/${req.request_id}`)}
                      className="flex-1 min-w-[120px] py-2.5 bg-amber-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-600">
                      <span className="material-symbols-outlined text-[16px]">star</span>Rate Workers
                    </button>
                  )}

                  {/* Dispute */}
                  {canDispute && (
                    <button onClick={() => navigate(`/customer/dispute/${req.request_id}`)}
                      className="px-3 py-2.5 border border-red-200 text-red-600 rounded-lg font-medium text-sm flex items-center gap-1 hover:bg-red-50">
                      <span className="material-symbols-outlined text-[16px]">gavel</span>Dispute
                    </button>
                  )}

                  {/* Details fallback */}
                  {!isTeamReady && !isPaymentDue && !isCompletionDue && !isDone && (
                    <div className="flex-1 py-2.5 bg-slate-100 rounded-lg flex items-center justify-center gap-2 text-slate-500 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Awaiting team assignment...
                    </div>
                  )}
                </div>
              </div>

              {/* Ready banner */}
              {isTeamReady && (
                <div className="px-5 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]"
                    style={{ fontVariationSettings:"'FILL' 1" }}>check_circle</span>
                  <span className="text-xs text-emerald-700 font-semibold">Your team is ready — track them live</span>
                </div>
              )}
            </div>
          );
        })}

        {/* New request CTA */}
        {requests.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-800">Need more workers?</p>
              <p className="text-xs text-slate-500">Submit a new work request anytime.</p>
            </div>
            <button onClick={() => navigate('/customer/booking/category')}
              className="shrink-0 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700">
              <span className="material-symbols-outlined text-[18px]">add</span>New Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
