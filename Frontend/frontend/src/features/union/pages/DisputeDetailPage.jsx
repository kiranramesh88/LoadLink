import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUnionDisputesApi, resolveDisputeApi } from '../services/unionAPI';
import toast from 'react-hot-toast';

const STATUS_CFG = {
  pending:      { label:'Pending',      color:'#b86200', bg:'rgba(184,98,0,0.1)',  icon:'report' },
  under_review: { label:'Under Review', color:'#6650a4', bg:'rgba(103,80,164,0.1)',icon:'manage_search' },
  resolved:     { label:'Resolved',     color:'#006b5c', bg:'rgba(0,107,92,0.1)', icon:'task_alt' },
  rejected:     { label:'Rejected',     color:'#ba1a1a', bg:'rgba(186,26,26,0.1)',icon:'cancel' },
};

const card = { background:'#fff', borderRadius:'12px', border:'1px solid #c3c5d9', padding:'20px', boxShadow:'0 2px 8px rgba(17,28,45,0.04)' };

export default function DisputeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [resolving, setResolving]     = useState(false);
  const [notes, setNotes]             = useState('');
  const [showResolve, setShowResolve] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchUnionDisputesApi();
        const all = res.data?.data || [];
        const found = all.find(d => d.dispute_id === id);
        if (found) setDispute(found);
        else toast.error('Dispute not found');
      } catch { toast.error('Failed to load dispute'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleResolve = async () => {
    if (!notes.trim()) { toast.error('Please enter resolution notes'); return; }
    setResolving(true);
    try {
      await resolveDisputeApi(id, notes);
      toast.success('Dispute resolved successfully!');
      navigate('/union/disputes');
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setResolving(false);
    }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:'12px' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid #e7eeff', borderTop:'3px solid #003ec7', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!dispute) return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <p style={{ fontSize:'16px', color:'#111c2d', fontWeight:700 }}>Dispute not found</p>
      <button onClick={() => navigate('/union/disputes')} style={{ marginTop:'16px', padding:'10px 24px', borderRadius:'8px', border:'none', background:'#003ec7', color:'#fff', fontWeight:700, cursor:'pointer' }}>Back</button>
    </div>
  );

  const cfg = STATUS_CFG[dispute.status] || STATUS_CFG.pending;
  const wr = dispute.work_request;
  const isOpen = ['pending','under_review'].includes(dispute.status);

  return (
    <div style={{ minHeight:'100vh', background:'#f9f9ff', fontFamily:'Inter, sans-serif', paddingBottom:'60px' }}>

      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #c3c5d9', padding:'16px 24px', display:'flex', alignItems:'center', gap:'16px', position:'sticky', top:0, zIndex:10 }}>
        <button onClick={() => navigate('/union/disputes')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'#434656', padding:'4px' }}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div style={{ flex:1 }}>
          <h1 style={{ margin:0, fontSize:'18px', fontWeight:800, color:'#111c2d' }}>Dispute Detail</h1>
          <p style={{ margin:0, fontSize:'11px', color:'#737688', fontFamily:'monospace' }}>{dispute.dispute_id}</p>
        </div>
        <span style={{ padding:'4px 12px', borderRadius:'999px', fontSize:'12px', fontWeight:700, color:cfg.color, background:cfg.bg }}>
          {cfg.label}
        </span>
      </div>

      <div style={{ maxWidth:'800px', margin:'24px auto', padding:'0 20px', display:'flex', flexDirection:'column', gap:'20px' }}>

        {/* Dispute reason */}
        <div style={{ ...card, border:`1px solid ${isOpen ? '#ffc6a0' : '#c3c5d9'}`, background: isOpen ? '#fffaf7' : '#fff' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'16px' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'10px', background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span className="material-symbols-outlined" style={{ fontSize:'24px', color:cfg.color }}>{cfg.icon}</span>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:'0 0 6px 0', fontSize:'11px', fontWeight:700, color:'#737688', textTransform:'uppercase', letterSpacing:'0.05em' }}>Dispute Reason</p>
              <p style={{ margin:'0 0 12px 0', fontSize:'15px', color:'#111c2d', lineHeight:1.6 }}>{dispute.reason}</p>
              <p style={{ margin:0, fontSize:'12px', color:'#737688' }}>
                Raised by <strong style={{ color:'#111c2d' }}>{dispute.raised_by?.full_name || 'Customer'}</strong>
                {' · '}{dispute.created_at ? new Date(dispute.created_at).toLocaleString('en-IN') : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Work Request Info */}
        {wr && (
          <div style={card}>
            <h2 style={{ margin:'0 0 14px 0', fontSize:'15px', fontWeight:700, color:'#111c2d', display:'flex', alignItems:'center', gap:'8px', paddingBottom:'10px', borderBottom:'1px solid #e7eeff' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px', color:'#003ec7' }}>assignment</span>
              Related Work Request
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'12px' }}>
              {[
                { label:'Work Type', value: wr.work_type?.replace(/_/g,' ') },
                { label:'Status',    value: wr.status?.replace(/_/g,' ') },
                { label:'District',  value: wr.district || '—' },
                { label:'Estimate',  value: wr.estimated_price ? `₹${parseFloat(wr.estimated_price).toFixed(0)}` : '—' },
              ].map(item => (
                <div key={item.label} style={{ background:'#f9f9ff', borderRadius:'8px', padding:'10px 12px', border:'1px solid #e7eeff' }}>
                  <p style={{ margin:'0 0 2px 0', fontSize:'10px', fontWeight:700, color:'#737688', textTransform:'uppercase' }}>{item.label}</p>
                  <p style={{ margin:0, fontSize:'14px', fontWeight:600, color:'#111c2d' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate(`/union/requests/${wr.request_id}`)}
              style={{ marginTop:'14px', padding:'8px 16px', borderRadius:'8px', border:'1px solid #c3c5d9', background:'#fff', color:'#003ec7', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>open_in_new</span>
              View Full Request
            </button>
          </div>
        )}

        {/* Resolution (if already resolved) */}
        {dispute.resolution_notes && (
          <div style={{ ...card, background:'rgba(0,107,92,0.05)', border:'1px solid rgba(0,107,92,0.2)' }}>
            <h2 style={{ margin:'0 0 10px 0', fontSize:'15px', fontWeight:700, color:'#006b5c', display:'flex', alignItems:'center', gap:'8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>task_alt</span>
              Resolution Notes
            </h2>
            <p style={{ margin:'0 0 8px 0', fontSize:'14px', color:'#111c2d', lineHeight:1.6 }}>{dispute.resolution_notes}</p>
            {dispute.resolved_by && (
              <p style={{ margin:0, fontSize:'12px', color:'#737688' }}>
                Resolved by <strong>{dispute.resolved_by.full_name}</strong>
                {dispute.resolved_at ? ` · ${new Date(dispute.resolved_at).toLocaleString('en-IN')}` : ''}
              </p>
            )}
          </div>
        )}

        {/* Resolve Action */}
        {isOpen && (
          <div style={card}>
            <h2 style={{ margin:'0 0 14px 0', fontSize:'15px', fontWeight:700, color:'#111c2d', display:'flex', alignItems:'center', gap:'8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px', color:'#006b5c' }}>verified</span>
              Resolve Dispute
            </h2>
            {!showResolve ? (
              <button onClick={() => setShowResolve(true)}
                style={{ padding:'10px 20px', borderRadius:'8px', border:'none', background:'#006b5c', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>edit_note</span>
                Write Resolution & Close
              </button>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Enter resolution notes — what was decided, any compensation offered, etc."
                  rows={4}
                  style={{ width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #c3c5d9', fontSize:'14px', resize:'vertical', outline:'none', fontFamily:'Inter, sans-serif', boxSizing:'border-box' }}
                />
                <div style={{ display:'flex', gap:'10px' }}>
                  <button onClick={handleResolve} disabled={resolving}
                    style={{ flex:1, padding:'12px', borderRadius:'8px', border:'none', background: resolving ? '#7fb8af' : '#006b5c', color:'#fff', fontWeight:700, fontSize:'14px', cursor: resolving ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                    {resolving ? (
                      <><div style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Resolving...</>
                    ) : (
                      <><span className="material-symbols-outlined" style={{ fontSize:'16px' }}>check_circle</span>Confirm Resolution</>
                    )}
                  </button>
                  <button onClick={() => setShowResolve(false)}
                    style={{ padding:'12px 20px', borderRadius:'8px', border:'1px solid #c3c5d9', background:'#fff', color:'#434656', fontWeight:600, fontSize:'14px', cursor:'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
