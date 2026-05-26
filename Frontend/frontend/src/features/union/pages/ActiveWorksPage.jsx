import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUnionRequestsApi } from '../services/unionAPI';
import toast from 'react-hot-toast';

const ACTIVE_STATUSES = ['workers_assigned','workers_on_the_way','workers_arrived','in_progress','work_completion_pending'];
const WORK_LABELS = {
  shop_unloading:'Shop / Textile Unloading', market_loading:'Vegetable Market Loading',
  household_shifting:'Household Shifting', construction:'Construction Material',
  warehouse:'Wholesale / Warehouse', other:'Other Labor',
};
const STATUS_CFG = {
  workers_assigned:       { label:'Workers Assigned',   color:'#003ec7', bg:'rgba(0,62,199,0.1)',   icon:'badge',            step:1 },
  workers_on_the_way:     { label:'On The Way',         color:'#6650a4', bg:'rgba(103,80,164,0.1)', icon:'directions_run',   step:2 },
  workers_arrived:        { label:'Arrived',            color:'#006b5c', bg:'rgba(0,107,92,0.12)',  icon:'location_on',      step:3 },
  in_progress:            { label:'In Progress',        color:'#006b5c', bg:'rgba(0,107,92,0.15)',  icon:'construction',     step:4 },
  work_completion_pending:{ label:'Completion Pending', color:'#b86200', bg:'rgba(184,98,0,0.1)',   icon:'pending_actions',  step:5 },
};

const card = { background:'#fff', borderRadius:'12px', border:'1px solid #c3c5d9', padding:'20px', boxShadow:'0 2px 8px rgba(17,28,45,0.04)' };

export default function ActiveWorksPage() {
  const navigate = useNavigate();
  const [works, setWorks]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchUnionRequestsApi();
      const all = res.data?.data || [];
      setWorks(all.filter(r => ACTIVE_STATUSES.includes(r.status)));
    } catch { toast.error('Failed to load active works'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  return (
    <div style={{ minHeight:'100vh', background:'#f9f9ff', fontFamily:'Inter, sans-serif' }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #c3c5d9', padding:'16px 24px', display:'flex', alignItems:'center', gap:'16px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ flex:1 }}>
          <h1 style={{ margin:0, fontSize:'20px', fontWeight:800, color:'#111c2d' }}>Active Works</h1>
          <p style={{ margin:0, fontSize:'12px', color:'#434656' }}>{works.length} operation{works.length !== 1 ? 's' : ''} in progress · auto-refreshes every 30s</p>
        </div>
        <button onClick={load} style={{ width:'36px', height:'36px', borderRadius:'8px', border:'1px solid #c3c5d9', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize:'18px', color:'#434656' }}>refresh</span>
        </button>
      </div>

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'24px 20px' }}>

        {/* Stat row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'12px', marginBottom:'24px' }}>
          {[
            { label:'Total Active', value:works.length, icon:'work', color:'#003ec7', bg:'#e7eeff' },
            { label:'On The Way', value:works.filter(w=>w.status==='workers_on_the_way').length, icon:'directions_run', color:'#6650a4', bg:'#f3eeff' },
            { label:'In Progress', value:works.filter(w=>w.status==='in_progress').length, icon:'construction', color:'#006b5c', bg:'rgba(0,107,92,0.1)' },
            { label:'Completion Pending', value:works.filter(w=>w.status==='work_completion_pending').length, icon:'pending_actions', color:'#b86200', bg:'#fff4e0' },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'9px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span className="material-symbols-outlined" style={{ fontSize:'20px', color:s.color }}>{s.icon}</span>
              </div>
              <div>
                <p style={{ margin:0, fontSize:'22px', fontWeight:800, color:'#111c2d' }}>{s.value}</p>
                <p style={{ margin:0, fontSize:'11px', color:'#737688' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[1,2,3].map(i => <div key={i} style={{ ...card, height:'130px', animation:'pulse 1.5s infinite', background:'#f0f3ff' }} />)}
          </div>
        ) : works.length === 0 ? (
          <div style={{ ...card, textAlign:'center', padding:'60px 20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize:'56px', color:'#c3c5d9', display:'block', marginBottom:'12px' }}>work_off</span>
            <p style={{ fontSize:'16px', fontWeight:600, color:'#111c2d', margin:'0 0 6px 0' }}>No active operations</p>
            <p style={{ fontSize:'13px', color:'#434656', margin:0 }}>Active works will appear here once teams are assigned and confirmed.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {works.map(req => {
              const cfg = STATUS_CFG[req.status] || STATUS_CFG.workers_assigned;
              const step = cfg.step;
              const leader = req.assigned_team?.team_leader;
              return (
                <div key={req.request_id} style={{ ...card, cursor:'pointer' }}
                  onClick={() => navigate(`/union/requests/${req.request_id}`)}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'16px' }}>

                    {/* Icon */}
                    <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize:'22px', color:cfg.color }}>{cfg.icon}</span>
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' }}>
                        <p style={{ margin:0, fontSize:'15px', fontWeight:700, color:'#111c2d' }}>
                          {WORK_LABELS[req.work_type] || req.work_type}
                        </p>
                        <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'999px', background:cfg.bg, color:cfg.color }}>{cfg.label}</span>
                      </div>

                      <p style={{ margin:'0 0 12px 0', fontSize:'12px', color:'#434656', display:'flex', gap:'12px', flexWrap:'wrap' }}>
                        <span>📍 {req.district || req.work_address || 'N/A'}</span>
                        <span>👷 {req.estimated_workers ?? '—'} workers</span>
                        <span>💰 ₹{req.estimated_price ? parseFloat(req.estimated_price).toFixed(0) : '—'}</span>
                        {leader && <span>🧑‍✈️ Lead: {leader.user?.full_name}</span>}
                      </p>

                      {/* Progress steps */}
                      <div style={{ display:'flex', gap:'0', alignItems:'center' }}>
                        {['Assigned','On Way','Arrived','Working','Done'].map((s, i) => {
                          const done = i+1 < step;
                          const active = i+1 === step;
                          return (
                            <React.Fragment key={s}>
                              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
                                <div style={{ width:'20px', height:'20px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                                  background: done ? '#003ec7' : active ? cfg.color : '#e7eeff',
                                  border: active ? `2px solid ${cfg.color}` : 'none' }}>
                                  {done ? <span className="material-symbols-outlined" style={{ fontSize:'12px', color:'#fff' }}>check</span>
                                    : active ? <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#fff', display:'block' }} /> : null}
                                </div>
                                <span style={{ fontSize:'9px', color: active ? cfg.color : '#737688', fontWeight: active ? 700 : 400, whiteSpace:'nowrap' }}>{s}</span>
                              </div>
                              {i < 4 && <div style={{ flex:1, height:'2px', background: i+1 < step ? '#003ec7' : '#e7eeff', margin:'0 2px 14px 2px', minWidth:'20px' }} />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    <span className="material-symbols-outlined" style={{ fontSize:'20px', color:'#c3c5d9', flexShrink:0 }}>chevron_right</span>
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
