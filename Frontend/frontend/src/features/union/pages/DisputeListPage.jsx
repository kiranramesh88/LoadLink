import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUnionDisputesApi } from '../services/unionAPI';
import toast from 'react-hot-toast';

const STATUS_CFG = {
  pending:      { label:'Pending',      color:'#b86200', bg:'rgba(184,98,0,0.1)',  icon:'report' },
  under_review: { label:'Under Review', color:'#6650a4', bg:'rgba(103,80,164,0.1)',icon:'manage_search' },
  resolved:     { label:'Resolved',     color:'#006b5c', bg:'rgba(0,107,92,0.1)', icon:'task_alt' },
  rejected:     { label:'Rejected',     color:'#ba1a1a', bg:'rgba(186,26,26,0.1)',icon:'cancel' },
};

const card = { background:'#fff', borderRadius:'12px', border:'1px solid #c3c5d9', padding:'20px', boxShadow:'0 2px 8px rgba(17,28,45,0.04)' };

export default function DisputeListPage() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchUnionDisputesApi();
      setDisputes(res.data?.data || []);
    } catch { toast.error('Failed to load disputes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? disputes : disputes.filter(d => d.status === filter);
  const countByStatus = (s) => disputes.filter(d => d.status === s).length;

  return (
    <div style={{ minHeight:'100vh', background:'#f9f9ff', fontFamily:'Inter, sans-serif' }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #c3c5d9', padding:'16px 24px', display:'flex', alignItems:'center', gap:'16px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ flex:1 }}>
          <h1 style={{ margin:0, fontSize:'20px', fontWeight:800, color:'#111c2d' }}>Disputes</h1>
          <p style={{ margin:0, fontSize:'12px', color:'#434656' }}>{disputes.length} total disputes</p>
        </div>
        <button onClick={load} style={{ width:'36px', height:'36px', borderRadius:'8px', border:'1px solid #c3c5d9', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize:'18px', color:'#434656' }}>refresh</span>
        </button>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'24px 20px' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'12px', marginBottom:'24px' }}>
          {[
            { key:'all',          label:'Total',        value:disputes.length,         color:'#003ec7', bg:'#e7eeff',              icon:'gavel' },
            { key:'pending',      label:'Pending',      value:countByStatus('pending'), color:'#b86200', bg:'rgba(184,98,0,0.1)',   icon:'report' },
            { key:'under_review', label:'Under Review', value:countByStatus('under_review'),color:'#6650a4',bg:'rgba(103,80,164,0.1)',icon:'manage_search'},
            { key:'resolved',     label:'Resolved',     value:countByStatus('resolved'),color:'#006b5c', bg:'rgba(0,107,92,0.1)',  icon:'task_alt' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              style={{ ...card, padding:'14px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', border: filter===s.key ? `2px solid ${s.color}` : '1px solid #c3c5d9', background: filter===s.key ? `${s.color}08` : '#fff' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span className="material-symbols-outlined" style={{ fontSize:'18px', color:s.color }}>{s.icon}</span>
              </div>
              <div style={{ textAlign:'left' }}>
                <p style={{ margin:0, fontSize:'20px', fontWeight:800, color:'#111c2d' }}>{s.value}</p>
                <p style={{ margin:0, fontSize:'11px', color:'#737688' }}>{s.label}</p>
              </div>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[1,2,3].map(i => <div key={i} style={{ ...card, height:'100px', animation:'pulse 1.5s infinite', background:'#f0f3ff' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...card, textAlign:'center', padding:'60px 20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize:'56px', color:'#c3c5d9', display:'block', marginBottom:'12px' }}>gavel</span>
            <p style={{ fontSize:'16px', fontWeight:600, color:'#111c2d', margin:0 }}>No disputes found</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {filtered.map(d => {
              const cfg = STATUS_CFG[d.status] || STATUS_CFG.pending;
              return (
                <div key={d.dispute_id} onClick={() => navigate(`/union/disputes/${d.dispute_id}`)}
                  style={{ ...card, cursor:'pointer', display:'flex', alignItems:'center', gap:'16px', transition:'box-shadow 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,62,199,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow='0 2px 8px rgba(17,28,45,0.04)'}>

                  <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:'22px', color:cfg.color }}>{cfg.icon}</span>
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                      <p style={{ margin:0, fontSize:'14px', fontWeight:700, color:'#111c2d' }}>
                        {d.work_request?.work_type?.replace(/_/g,' ') || 'Work Request'}
                      </p>
                      <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'999px', background:cfg.bg, color:cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p style={{ margin:0, fontSize:'12px', color:'#434656', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {d.reason}
                    </p>
                    <p style={{ margin:'4px 0 0 0', fontSize:'11px', color:'#737688' }}>
                      Raised by {d.raised_by?.full_name || 'Customer'} · {d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN') : ''}
                    </p>
                  </div>

                  <span className="material-symbols-outlined" style={{ fontSize:'20px', color:'#c3c5d9', flexShrink:0 }}>chevron_right</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
