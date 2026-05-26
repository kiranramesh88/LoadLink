import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUnionRequestsApi } from '../services/unionAPI';
import toast from 'react-hot-toast';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000';

const WORK_LABELS = {
  shop_unloading: 'Shop / Textile Unloading',
  market_loading: 'Vegetable Market Loading',
  household_shifting: 'Household Shifting',
  construction: 'Construction Material',
  warehouse: 'Wholesale / Warehouse',
  other: 'Other Labor',
};

const STATUS_CFG = {
  pending:          { label: 'Pending',           color: '#6650a4', bg: 'rgba(103,80,164,0.1)',  icon: 'hourglass_empty' },
  union_review:     { label: 'Under Review',      color: '#b86200', bg: 'rgba(184,98,0,0.1)',    icon: 'manage_search' },
  team_suggested:   { label: 'Team Suggested',    color: '#006b5c', bg: 'rgba(0,107,92,0.1)',    icon: 'groups' },
  team_confirmed:   { label: 'Team Confirmed',    color: '#006b5c', bg: 'rgba(0,107,92,0.12)',   icon: 'verified' },
  workers_assigned: { label: 'Workers Assigned',  color: '#003ec7', bg: 'rgba(0,62,199,0.1)',    icon: 'badge' },
  workers_on_the_way:{ label: 'On The Way',       color: '#003ec7', bg: 'rgba(0,62,199,0.12)',   icon: 'directions_run' },
  in_progress:      { label: 'In Progress',       color: '#006b5c', bg: 'rgba(0,107,92,0.15)',   icon: 'construction' },
  work_completion_pending:{ label: 'Completion Pending', color:'#b86200', bg:'rgba(184,98,0,0.1)', icon:'pending_actions' },
  payment_pending:  { label: 'Payment Pending',   color: '#b86200', bg: 'rgba(184,98,0,0.1)',    icon: 'payments' },
  completed:        { label: 'Completed',         color: '#006b5c', bg: 'rgba(0,107,92,0.1)',    icon: 'task_alt' },
  cancelled:        { label: 'Cancelled',         color: '#ba1a1a', bg: 'rgba(186,26,26,0.08)',  icon: 'cancel' },
  disputed:         { label: 'Disputed',          color: '#ba1a1a', bg: 'rgba(186,26,26,0.1)',   icon: 'gavel' },
};

const PRIORITY_CFG = {
  urgent: { color: '#ba1a1a', bg: '#ffeaea' },
  high:   { color: '#b86200', bg: '#fff4e0' },
  medium: { color: '#6650a4', bg: '#f3eeff' },
  low:    { color: '#434656', bg: '#f0f3ff' },
};

const TABS = [
  { key: 'new',       label: 'New',         statuses: ['pending', 'union_review'] },
  { key: 'team',      label: 'Team Review',  statuses: ['team_suggested', 'team_confirmed', 'workers_assigned'] },
  { key: 'active',    label: 'Active',       statuses: ['workers_on_the_way', 'in_progress', 'work_completion_pending', 'payment_pending'] },
  { key: 'done',      label: 'Completed',    statuses: ['completed', 'cancelled', 'disputed'] },
];

export default function UnionRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('new');
  const [search, setSearch]             = useState('');
  const [newNotifs, setNewNotifs]       = useState([]);  // real-time popup queue
  const [newCount, setNewCount]         = useState(0);
  const wsRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchUnionRequestsApi();
      const data = res.data?.data || [];
      setRequests(data);
    } catch (e) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // WebSocket — listen for new requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`${WS_BASE}/ws/union-dashboard/?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'new_request' || msg.event_type === 'new_request') {
          const req = msg.data || msg;
          setNewNotifs(prev => [req, ...prev]);
          setNewCount(c => c + 1);
          // Auto-refresh list
          load();
          // Show toast popup
          toast.custom((t) => (
            <div style={{
              background: '#fff', border: '1px solid #c3c5d9', borderLeft: '4px solid #003ec7',
              borderRadius: '10px', padding: '14px 18px', boxShadow: '0 4px 16px rgba(17,28,45,0.12)',
              display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '340px',
              animation: 'slideIn 0.3s ease',
            }}>
              <span className="material-symbols-outlined" style={{ color: '#003ec7', fontSize: '24px', marginTop: '2px' }}>assignment_add</span>
              <div>
                <p style={{ margin: '0 0 2px 0', fontWeight: 700, fontSize: '14px', color: '#111c2d' }}>New Work Request</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#434656' }}>
                  {WORK_LABELS[req.work_type] || req.work_type} — {req.district || 'N/A'}
                </p>
              </div>
              <button onClick={() => toast.dismiss(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#434656', marginLeft: 'auto' }}>✕</button>
            </div>
          ), { duration: 8000, position: 'top-right' });
        }
      } catch {}
    };

    return () => ws.close();
  }, [load]);

  const tabDef = TABS.find(t => t.key === activeTab);
  const filtered = requests.filter(r =>
    tabDef.statuses.includes(r.status) &&
    (!search || (r.work_type + r.district + r.work_address + (r.customer?.user?.full_name || ''))
      .toLowerCase().includes(search.toLowerCase()))
  );

  const tabCount = (tab) => requests.filter(r => TABS.find(t => t.key === tab)?.statuses.includes(r.status)).length;

  const s = { background: '#fff', borderRadius: '12px', border: '1px solid #c3c5d9', padding: '20px', boxShadow: '0 2px 8px rgba(17,28,45,0.04)' };

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9ff', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #c3c5d9', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#111c2d' }}>Work Requests</h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#434656' }}>{requests.length} total requests</p>
        </div>

        {/* New count badge */}
        {newCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e7eeff', border: '1px solid #b7c4ff', borderRadius: '999px', padding: '4px 12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#003ec7', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#003ec7' }}>{newCount} new</span>
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#737688' }}>search</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search requests..."
            style={{ paddingLeft: '36px', paddingRight: '12px', height: '36px', borderRadius: '8px', border: '1px solid #c3c5d9', fontSize: '13px', width: '220px', outline: 'none', background: '#f9f9ff' }}
          />
        </div>

        <button onClick={load} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #c3c5d9', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#434656' }}>refresh</span>
        </button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#f0f3ff', borderRadius: '10px', padding: '4px' }}>
          {TABS.map(tab => {
            const cnt = tabCount(tab.key);
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); if (tab.key === 'new') setNewCount(0); }}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: active ? '#fff' : 'transparent', color: active ? '#111c2d' : '#434656',
                  fontWeight: active ? 700 : 500, fontSize: '13px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px', boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}>
                {tab.label}
                {cnt > 0 && (
                  <span style={{
                    minWidth: '18px', height: '18px', borderRadius: '999px', fontSize: '11px', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                    background: active ? (tab.key === 'new' ? '#003ec7' : '#e7eeff') : '#e7eeff',
                    color: active ? (tab.key === 'new' ? '#fff' : '#003ec7') : '#003ec7',
                  }}>{cnt}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Request cards */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => <div key={i} style={{ ...s, height: '120px', animation: 'pulse 1.5s infinite', background: '#f0f3ff' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...s, textAlign: 'center', padding: '60px 20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#c3c5d9', display: 'block', marginBottom: '12px' }}>inbox</span>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#111c2d', margin: '0 0 6px 0' }}>No {tabDef.label.toLowerCase()} requests</p>
            <p style={{ fontSize: '13px', color: '#434656', margin: 0 }}>Requests will appear here as they come in.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(req => {
              const cfg = STATUS_CFG[req.status] || STATUS_CFG.pending;
              const pri = PRIORITY_CFG[req.priority] || PRIORITY_CFG.medium;
              return (
                <div key={req.request_id}
                  onClick={() => navigate(`/union/requests/${req.request_id}`)}
                  style={{ ...s, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'box-shadow 0.15s', padding: '16px 20px' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,62,199,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(17,28,45,0.04)'}>

                  {/* Icon */}
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: cfg.color }}>{cfg.icon}</span>
                  </div>

                  {/* Main */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111c2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {WORK_LABELS[req.work_type] || req.work_type}
                      </p>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: pri.bg, color: pri.color, flexShrink: 0 }}>
                        {req.priority?.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#434656', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>📍 {req.district || 'N/A'}</span>
                      <span>📅 {req.scheduled_date || '—'}</span>
                      <span>👷 {req.estimated_workers ?? '—'} workers</span>
                      <span>💰 ₹{req.estimated_price ? parseFloat(req.estimated_price).toFixed(0) : '—'}</span>
                      {req.customer?.full_name && <span>🧑 {req.customer.full_name}</span>}
                    </p>
                  </div>

                  {/* Status + chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#c3c5d9' }}>chevron_right</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
