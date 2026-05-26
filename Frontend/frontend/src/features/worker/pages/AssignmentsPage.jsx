import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAssignments, acceptAssignment, rejectAssignment } from '../slice/workerSlice';

const STATUS_TABS = [
  { key: '',          label: 'All' },
  { key: 'assigned',  label: 'Pending' },
  { key: 'accepted',  label: 'Accepted' },
  { key: 'completed', label: 'Completed' },
];

const WORK_TYPE_LABELS = {
  shop_unloading:     'Shop / Textile Unloading',
  market_loading:     'Vegetable Market Loading',
  household_shifting: 'Household Shifting',
  construction:       'Construction Material',
  warehouse:          'Wholesale / Warehouse',
  other:              'Other Labor',
};

const STATUS_STYLE = {
  assigned:    { label: 'Pending',     bg: '#fff7ed', color: '#b45309', border: '#fde68a' },
  accepted:    { label: 'Accepted',    bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  in_progress: { label: 'In Progress', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  completed:   { label: 'Completed',   bg: '#f9fafb', color: '#374151', border: '#e5e7eb' },
  rejected:    { label: 'Rejected',    bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const formatTime = (time) => {
  if (!time) return '—';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export default function AssignmentsPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { assignments, assignmentsLoading, actionLoading } = useSelector((s) => s.worker);
  const { user }  = useSelector((s) => s.auth);
  const lang      = user?.language || 'en';
  const [activeTab, setActiveTab] = useState('');

  const load = useCallback(() => {
    dispatch(fetchAssignments(activeTab));
  }, [dispatch, activeTab]);

  useEffect(() => { load(); }, [load]);

  const filtered = activeTab
    ? assignments.filter((a) => a.assignment_status === activeTab)
    : assignments;

  const pendingCount = assignments.filter(a => a.assignment_status === 'assigned').length;
  const showSkeletons = assignmentsLoading && assignments.length === 0;

  return (
    <div className="min-h-screen bg-surface-bright">

      {/* ── Header ── */}
      <div className="bg-surface border-b border-outline-variant px-4 pt-4 pb-0 sticky top-0 z-10">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
            <div>
              <h1 className="text-xl font-bold text-on-surface">
                {lang === 'ml' ? 'എന്റെ അസൈൻമെന്റുകൾ' : 'My Assignments'}
              </h1>
              {pendingCount > 0 && (
                <p style={{ fontSize:'12px', color:'#b45309', fontWeight:600, marginTop:'2px' }}>
                  {pendingCount} pending response{pendingCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button onClick={load}
              style={{ width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'none', background:'transparent', cursor:'pointer' }}>
              <span className={`material-symbols-outlined text-on-surface-variant ${assignmentsLoading ? 'animate-spin' : ''}`}
                style={{ fontSize:'20px' }}>refresh</span>
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', overflowX:'auto' }}>
            {STATUS_TABS.map((tab) => {
              const count = tab.key
                ? assignments.filter(a => a.assignment_status === tab.key).length
                : assignments.length;
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding:'10px 16px',
                    fontSize:'14px',
                    fontWeight: 600,
                    whiteSpace:'nowrap',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                    background:'transparent',
                    border:'none',
                    borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                    cursor:'pointer',
                    display:'flex', alignItems:'center', gap:'6px',
                  }}>
                  {tab.label}
                  {count > 0 && (
                    <span style={{
                      minWidth:'18px', height:'18px', borderRadius:'999px',
                      fontSize:'10px', fontWeight:'bold',
                      display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px',
                      background: isActive ? 'var(--color-primary)' : 'var(--color-surface-container)',
                      color: isActive ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding:'16px', maxWidth:'600px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'12px' }}>

        {/* Loading skeletons */}
        {showSkeletons && [1,2,3].map(i => (
          <div key={i} className="bg-surface border border-outline-variant"
            style={{ borderRadius:'16px', padding:'20px', animation:'pulse 1.5s infinite' }}>
            <div style={{ height:'16px', background:'var(--color-surface-container)', borderRadius:'8px', width:'75%', marginBottom:'12px' }} />
            <div style={{ height:'12px', background:'var(--color-surface-container-low)', borderRadius:'8px', width:'50%', marginBottom:'8px' }} />
            <div style={{ height:'12px', background:'var(--color-surface-container-low)', borderRadius:'8px', width:'65%' }} />
          </div>
        ))}

        {/* Empty state */}
        {!showSkeletons && filtered.length === 0 && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', gap:'12px' }}>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize:'48px' }}>assignment_late</span>
            <p className="text-on-surface-variant" style={{ fontSize:'14px', textAlign:'center' }}>
              {lang === 'ml' ? 'അസൈൻമെന്റുകൾ ഒന്നും ഇല്ല' : 'No assignments found'}
            </p>
          </div>
        )}

        {/* Assignment cards */}
        {!showSkeletons && filtered.map((a) => {
          console.log(a);
          const s = STATUS_STYLE[a.assignment_status] || STATUS_STYLE.assigned;
          const workLabel = WORK_TYPE_LABELS[a.work_type] || (a.work_type?.replace(/_/g, ' ') || 'Work Request');
          const isPending = a.assignment_status === 'assigned';
          const isActive  = ['accepted', 'in_progress'].includes(a.assignment_status);

          return (
            <div key={a.assignment_id} className="bg-surface border border-outline-variant"
              style={{ borderRadius:'16px', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>

              {/* Card header */}
              <div style={{
                padding:'12px 16px',
                borderBottom:'1px solid',
                borderColor: s.border,
                background: s.bg,
                display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize:'18px', color: s.color, fontVariationSettings:"'FILL' 1", flexShrink:0 }}>
                    {isPending ? 'notifications_active' : isActive ? 'construction' : 'task_alt'}
                  </span>
                  <h3 className="text-on-surface" style={{ fontWeight:700, fontSize:'14px', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {a.work_title || workLabel}
                  </h3>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
                  {a.is_team_leader && (
                    <span style={{
                      fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'999px',
                      background:'#fef3c7', color:'#92400e',
                    }}>⭐ Leader</span>
                  )}
                  <span style={{
                    fontSize:'11px', fontWeight:700, padding:'2px 10px', borderRadius:'999px',
                    border:`1px solid ${s.border}`, background: s.bg, color: s.color,
                  }}>
                    {s.label}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding:'16px' }}>
                <p className="text-on-surface-variant" style={{ fontSize:'12px', fontWeight:600, margin:'0 0 12px' }}>{workLabel}</p>

                {/* Date / time / address */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <span className="material-symbols-outlined text-primary" style={{ fontSize:'14px' }}>calendar_today</span>
                    <span className="text-on-surface" style={{ fontSize:'12px' }}>{a.scheduled_date || '—'}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <span className="material-symbols-outlined text-primary" style={{ fontSize:'14px' }}>schedule</span>
                    <span className="text-on-surface" style={{ fontSize:'12px' }}>{formatTime(a.scheduled_time)}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', gridColumn:'1/-1' }}>
                    <span className="material-symbols-outlined text-primary" style={{ fontSize:'14px', flexShrink:0 }}>location_on</span>
                    <span className="text-on-surface-variant" style={{ fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {a.work_address || 'Accept to view location'}
                    </span>
                  </div>
                </div>

                {/* Accept / Decline */}
                {isPending && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                    <button onClick={() => dispatch(rejectAssignment(a.assignment_id))}
                      disabled={actionLoading}
                      className="border border-outline-variant text-on-surface-variant"
                      style={{ padding:'10px', borderRadius:'12px', fontWeight:600, fontSize:'14px', background:'transparent', cursor:'pointer', opacity: actionLoading ? 0.5 : 1 }}>
                      {lang === 'ml' ? 'നിരസിക്കുക' : 'Decline'}
                    </button>
                    <button onClick={() => dispatch(acceptAssignment(a.assignment_id))}
                      disabled={actionLoading}
                      className="bg-primary text-on-primary"
                      style={{ padding:'10px', borderRadius:'12px', fontWeight:700, fontSize:'14px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', opacity: actionLoading ? 0.5 : 1 }}>
                      {actionLoading
                        ? <div style={{ width:'16px', height:'16px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} />
                        : <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>check</span>}
                      {lang === 'ml' ? 'സ്വീകരിക്കുക' : 'Accept'}
                    </button>
                  </div>
                )}

                {/* View work */}
                {isActive && (
                  <button onClick={() => navigate(`/worker/work/${a.work_request_id}`)}
                    className="text-primary border border-outline-variant"
                    style={{ width:'100%', padding:'10px', borderRadius:'12px', fontWeight:600, fontSize:'14px', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>open_in_new</span>
                    {lang === 'ml' ? 'ജോലി കാണുക' : 'View Work'}
                  </button>
                )}

                {/* Completed state */}
                {a.assignment_status === 'completed' && (
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'var(--color-surface-container-low)', borderRadius:'12px' }}>
                    <span className="material-symbols-outlined text-primary" style={{ fontSize:'16px', fontVariationSettings:"'FILL' 1" }}>task_alt</span>
                    <span className="text-on-surface-variant" style={{ fontSize:'12px', fontWeight:600 }}>Work completed</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
