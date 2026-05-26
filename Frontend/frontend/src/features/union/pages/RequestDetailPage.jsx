import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRequestDetailApi, generateTeamApi, confirmTeamApi } from '../services/unionAPI';
import toast from 'react-hot-toast';

const WORK_LABELS = {
  shop_unloading:'Shop / Textile Unloading', market_loading:'Vegetable Market Loading',
  household_shifting:'Household Shifting', construction:'Construction Material',
  warehouse:'Wholesale / Warehouse', other:'Other Labor',
};

const STATUS_CFG = {
  pending:{label:'Pending',color:'#6650a4'}, union_review:{label:'Under Review',color:'#b86200'},
  team_suggested:{label:'Team Suggested',color:'#006b5c'}, team_confirmed:{label:'Confirmed',color:'#006b5c'},
  workers_assigned:{label:'Workers Assigned',color:'#003ec7'}, in_progress:{label:'In Progress',color:'#006b5c'},
  work_completion_pending:{label:'Completion Pending',color:'#b86200'},
  payment_pending:{label:'Payment Pending',color:'#b86200'}, completed:{label:'Completed',color:'#006b5c'},
  cancelled:{label:'Cancelled',color:'#ba1a1a'}, disputed:{label:'Disputed',color:'#ba1a1a'},
};

const AVAIL_CFG = {
  available: { label:'Available', color:'#006b5c', bg:'rgba(0,107,92,0.1)' },
  busy:       { label:'Busy',      color:'#b86200', bg:'rgba(184,98,0,0.1)' },
  offline:    { label:'Offline',   color:'#737688', bg:'rgba(115,118,136,0.1)' },
};

const VERIFY_CFG = {
  verified:   { label:'Verified',   color:'#006b5c', icon:'verified' },
  pending:    { label:'Pending',    color:'#b86200', icon:'schedule' },
  unverified: { label:'Unverified', color:'#ba1a1a', icon:'cancel' },
};

function StarRating({ value = 0 }) {
  const stars = Math.round(value * 2) / 2;
  return (
    <span style={{ display:'inline-flex', gap:'1px', alignItems:'center' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className="material-symbols-outlined" style={{ fontSize:'13px',
          color: stars >= i ? '#f59e0b' : stars >= i - 0.5 ? '#f59e0b' : '#d1d5db',
          fontVariationSettings: stars >= i ? "'FILL' 1" : "'FILL' 0"
        }}>star</span>
      ))}
      <span style={{ fontSize:'11px', color:'#737688', marginLeft:'2px' }}>{value?.toFixed(1)}</span>
    </span>
  );
}

function WorkerCard({ worker, isLeader }) {
  const avail  = AVAIL_CFG[worker.availability_status]  || AVAIL_CFG.offline;
  const verify = VERIFY_CFG[worker.verification_status] || VERIFY_CFG.pending;
  const initials = worker.full_name?.charAt(0)?.toUpperCase() || 'W';
  const reliability = Math.min(100, Math.round(worker.reliability_score ?? 100));

  return (
    <div style={{
      background: isLeader ? 'linear-gradient(135deg,#e7eeff 0%,#f0f3ff 100%)' : '#f9f9ff',
      border: isLeader ? '1.5px solid #b7c4ff' : '1px solid #e7eeff',
      borderRadius:'12px', padding:'14px 16px',
      boxShadow: isLeader ? '0 2px 12px rgba(0,62,199,0.08)' : 'none',
    }}>
      {/* Top row: avatar + name */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
        {/* Avatar */}
        <div style={{ position:'relative', flexShrink:0 }}>
          {worker.profile_photo ? (
            <img src={worker.profile_photo} alt={worker.full_name}
              style={{ width:'44px', height:'44px', borderRadius:'50%', objectFit:'cover', border: isLeader ? '2px solid #003ec7' : '2px solid #e7eeff' }} />
          ) : (
            <div style={{ width:'44px', height:'44px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:800,
              background: isLeader ? '#003ec7' : '#e7eeff', color: isLeader ? '#fff' : '#003ec7',
              border: isLeader ? '2px solid #003ec7' : '2px solid #e7eeff' }}>
              {initials}
            </div>
          )}
          {/* Leader crown */}
          {isLeader && (
            <span className="material-symbols-outlined" style={{ position:'absolute', top:'-6px', right:'-6px', fontSize:'16px', color:'#f59e0b', background:'#fff', borderRadius:'50%', padding:'1px' }}>military_tech</span>
          )}
        </div>

        {/* Name + phone */}
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ margin:'0 0 2px 0', fontSize:'14px', fontWeight:700, color:'#111c2d', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {worker.full_name || '—'}
          </p>
          <p style={{ margin:'0 0 3px 0', fontSize:'12px', color:'#434656' }}>{worker.phone_number || '—'}</p>
          <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
            {/* Verification badge */}
            <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', fontSize:'10px', fontWeight:700, color:verify.color, background:`${verify.color}15`, padding:'2px 7px', borderRadius:'999px' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'11px' }}>{verify.icon}</span>{verify.label}
            </span>
            {/* Availability */}
            <span style={{ fontSize:'10px', fontWeight:700, color:avail.color, background:avail.bg, padding:'2px 7px', borderRadius:'999px' }}>
              {avail.label}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
        {/* Experience */}
        <div style={{ background:'rgba(255,255,255,0.7)', borderRadius:'8px', padding:'8px 10px', border:'1px solid rgba(195,197,217,0.4)' }}>
          <p style={{ margin:'0 0 2px 0', fontSize:'10px', fontWeight:700, color:'#737688', textTransform:'uppercase' }}>Experience</p>
          <p style={{ margin:0, fontSize:'14px', fontWeight:700, color:'#111c2d' }}>{worker.experience_years ?? 0} <span style={{ fontSize:'11px', fontWeight:400, color:'#737688' }}>yrs</span></p>
        </div>

        {/* Rating */}
        <div style={{ background:'rgba(255,255,255,0.7)', borderRadius:'8px', padding:'8px 10px', border:'1px solid rgba(195,197,217,0.4)' }}>
          <p style={{ margin:'0 0 3px 0', fontSize:'10px', fontWeight:700, color:'#737688', textTransform:'uppercase' }}>Rating</p>
          <StarRating value={worker.average_rating ?? 5} />
        </div>

        {/* Completed works */}
        <div style={{ background:'rgba(255,255,255,0.7)', borderRadius:'8px', padding:'8px 10px', border:'1px solid rgba(195,197,217,0.4)' }}>
          <p style={{ margin:'0 0 2px 0', fontSize:'10px', fontWeight:700, color:'#737688', textTransform:'uppercase' }}>Completed</p>
          <p style={{ margin:0, fontSize:'14px', fontWeight:700, color:'#111c2d' }}>{worker.total_completed_works ?? 0} <span style={{ fontSize:'11px', fontWeight:400, color:'#737688' }}>jobs</span></p>
        </div>

        {/* Workload */}
        <div style={{ background:'rgba(255,255,255,0.7)', borderRadius:'8px', padding:'8px 10px', border:'1px solid rgba(195,197,217,0.4)' }}>
          <p style={{ margin:'0 0 2px 0', fontSize:'10px', fontWeight:700, color:'#737688', textTransform:'uppercase' }}>Workload</p>
          <p style={{ margin:0, fontSize:'14px', fontWeight:700, color:'#111c2d' }}>{worker.workload_score?.toFixed(1) ?? '0.0'}</p>
        </div>
      </div>

      {/* Reliability bar */}
      <div style={{ marginTop:'10px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
          <span style={{ fontSize:'10px', fontWeight:700, color:'#737688', textTransform:'uppercase' }}>Reliability</span>
          <span style={{ fontSize:'10px', fontWeight:800, color: reliability >= 80 ? '#006b5c' : reliability >= 60 ? '#b86200' : '#ba1a1a' }}>{reliability}%</span>
        </div>
        <div style={{ height:'4px', borderRadius:'999px', background:'#e7eeff', overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:'999px', width:`${reliability}%`,
            background: reliability >= 80 ? '#006b5c' : reliability >= 60 ? '#f59e0b' : '#ba1a1a',
            transition:'width 0.5s ease' }} />
        </div>
      </div>
    </div>
  );
}

const card = { background:'#fff', borderRadius:'12px', border:'1px solid #c3c5d9', padding:'20px', boxShadow:'0 2px 8px rgba(17,28,45,0.04)' };

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [req, setReq]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [cfmLoading, setCfmLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchRequestDetailApi(id);
      setReq(res.data?.data || res.data);
    } catch {
      toast.error('Failed to load request');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleGenerateTeam = async () => {
    setGenLoading(true);
    try {
      await generateTeamApi(id);
      toast.success('Team generated successfully!');
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || 'Failed to generate team');
    } finally {
      setGenLoading(false);
    }
  };

  const handleConfirmTeam = async () => {
    setCfmLoading(true);
    try {
      await confirmTeamApi(id);
      toast.success('Team confirmed! Workers notified.');
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || 'Failed to confirm team');
    } finally {
      setCfmLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:'12px' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid #e7eeff', borderTop:'3px solid #003ec7', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:'#434656' }}>Loading request...</p>
    </div>
  );

  if (!req) return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <p style={{ fontSize:'18px', color:'#111c2d', fontWeight:700 }}>Request not found</p>
      <button onClick={() => navigate('/union/requests')} style={{ marginTop:'16px', padding:'10px 24px', borderRadius:'8px', border:'none', background:'#003ec7', color:'#fff', fontWeight:700, cursor:'pointer' }}>Back to Requests</button>
    </div>
  );

  const cfg = STATUS_CFG[req.status] || STATUS_CFG.pending;
  const team = req.assigned_team;
  const canGenerate = !team && ['pending','union_review'].includes(req.status);
  const canConfirm  = team && req.status === 'team_suggested';

  return (
    <div style={{ minHeight:'100vh', background:'#f9f9ff', fontFamily:'Inter, sans-serif', paddingBottom:'60px' }}>

      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #c3c5d9', padding:'16px 24px', display:'flex', alignItems:'center', gap:'16px', position:'sticky', top:0, zIndex:10 }}>
        <button onClick={() => navigate('/union/requests')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'#434656', padding:'4px' }}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div style={{ flex:1 }}>
          <h1 style={{ margin:0, fontSize:'18px', fontWeight:800, color:'#111c2d' }}>{WORK_LABELS[req.work_type] || req.work_type}</h1>
          <p style={{ margin:0, fontSize:'11px', color:'#737688', fontFamily:'monospace' }}>{req.request_id}</p>
        </div>
        <span style={{ padding:'4px 12px', borderRadius:'999px', fontSize:'12px', fontWeight:700, color:cfg.color, background:`${cfg.color}18` }}>
          {cfg.label}
        </span>
      </div>

      <div style={{ maxWidth:'900px', margin:'24px auto', padding:'0 20px', display:'flex', flexDirection:'column', gap:'20px' }}>

        {/* Action Banner */}
        {(canGenerate || canConfirm) && (
          <div style={{ background: canGenerate ? 'linear-gradient(135deg,#e7eeff,#f0f3ff)' : 'linear-gradient(135deg,#e7fff7,#f0fffa)',
            border: `1px solid ${canGenerate ? '#b7c4ff' : '#68fadd'}`, borderRadius:'12px', padding:'16px 20px',
            display:'flex', alignItems:'center', gap:'16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize:'28px', color: canGenerate ? '#003ec7' : '#006b5c' }}>
              {canGenerate ? 'group_add' : 'verified'}
            </span>
            <div style={{ flex:1 }}>
              <p style={{ margin:'0 0 2px 0', fontWeight:700, fontSize:'15px', color:'#111c2d' }}>
                {canGenerate ? 'Generate AI Team Recommendation' : 'Confirm Assigned Team'}
              </p>
              <p style={{ margin:0, fontSize:'12px', color:'#434656' }}>
                {canGenerate ? 'System will auto-select the best available workers based on workload balance.' : 'Review the suggested team below and confirm their assignment.'}
              </p>
            </div>
            <button
              onClick={canGenerate ? handleGenerateTeam : handleConfirmTeam}
              disabled={genLoading || cfmLoading}
              style={{ padding:'10px 20px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:700, fontSize:'13px',
                background: canGenerate ? '#003ec7' : '#006b5c', color:'#fff',
                opacity: (genLoading || cfmLoading) ? 0.7 : 1,
                display:'flex', alignItems:'center', gap:'8px', whiteSpace:'nowrap' }}>
              {(genLoading || cfmLoading) ? (
                <><div style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Working...</>
              ) : canGenerate ? (
                <><span className="material-symbols-outlined" style={{ fontSize:'16px' }}>auto_awesome</span> Generate Team</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize:'16px' }}>check_circle</span> Confirm Team</>
              )}
            </button>
          </div>
        )}

        {/* Two-column layout */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(400px, 1fr))', gap:'20px' }}>

          {/* Job Details */}
          <div style={card}>
            <h2 style={{ margin:'0 0 16px 0', fontSize:'15px', fontWeight:700, color:'#111c2d', display:'flex', alignItems:'center', gap:'8px', paddingBottom:'12px', borderBottom:'1px solid #e7eeff' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px', color:'#003ec7' }}>assignment</span>
              Job Details
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {[
                { icon:'location_on',    label:'Address',   value: req.work_address || req.district },
                { icon:'map',            label:'District',  value: req.district },
                { icon:'calendar_today', label:'Date',      value: req.scheduled_date || '—' },
                { icon:'schedule',       label:'Time',      value: req.scheduled_time || '—' },
                { icon:'group',          label:'Workers',   value: req.estimated_workers ?? '—' },
                { icon:'timer',          label:'Duration',  value: req.estimated_duration_hours ? `${req.estimated_duration_hours}h` : '—' },
                { icon:'payments',       label:'Estimate',  value: req.estimated_price ? `₹${parseFloat(req.estimated_price).toFixed(0)}` : '—' },
                { icon:'priority_high',  label:'Priority',  value: req.priority?.toUpperCase() || '—' },
              ].map(item => (
                <div key={item.label} style={{ background:'#f9f9ff', borderRadius:'8px', padding:'10px 12px', border:'1px solid #e7eeff' }}>
                  <p style={{ margin:'0 0 2px 0', fontSize:'10px', fontWeight:700, color:'#737688', textTransform:'uppercase', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize:'12px' }}>{item.icon}</span>{item.label}
                  </p>
                  <p style={{ margin:0, fontSize:'14px', fontWeight:600, color:'#111c2d' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div style={card}>
            <h2 style={{ margin:'0 0 16px 0', fontSize:'15px', fontWeight:700, color:'#111c2d', display:'flex', alignItems:'center', gap:'8px', paddingBottom:'12px', borderBottom:'1px solid #e7eeff' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px', color:'#003ec7' }}>person</span>
              Customer
            </h2>
            {req.customer ? (
              <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'#e7eeff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:800, color:'#003ec7', flexShrink:0 }}>
                  {req.customer?.full_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p style={{ margin:'0 0 2px 0', fontWeight:700, fontSize:'15px', color:'#111c2d' }}>{req.customer?.full_name || '—'}</p>
                  <p style={{ margin:'0 0 2px 0', fontSize:'12px', color:'#434656' }}>{req.customer?.phone_number || '—'}</p>
                  <p style={{ margin:'0 0 2px 0', fontSize:'12px', color:'#434656' }}>{req.customer?.email || '—'}</p>
                  <p style={{ margin:0, fontSize:'12px', color:'#434656' }}>{req.customer?.business_name || '—'}</p>
                </div>
              </div>
            ) : <p style={{ color:'#737688', fontSize:'13px' }}>No customer info</p>}
          </div>
        </div>

        {/* Assigned Team */}
        {team && (
          <div style={card}>
            <h2 style={{ margin:'0 0 16px 0', fontSize:'15px', fontWeight:700, color:'#111c2d', display:'flex', alignItems:'center', gap:'8px', paddingBottom:'12px', borderBottom:'1px solid #e7eeff' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px', color:'#006b5c' }}>groups</span>
              Assigned Team
              <span style={{ marginLeft:'auto', fontSize:'12px', padding:'3px 10px', borderRadius:'999px', background:'rgba(0,107,92,0.1)', color:'#006b5c', fontWeight:700 }}>
                {team.total_workers ?? ((team.workers?.length || 0) + (team.team_leader ? 1 : 0))} Workers
              </span>
            </h2>

            {/* ── Team Leader ── */}
            {team.team_leader && (
              <div style={{ marginBottom:'16px' }}>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#003ec7', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:'14px' }}>star</span>
                  Team Leader
                </p>
                <WorkerCard worker={team.team_leader} isLeader={true} />
              </div>
            )}

            {/* ── Team Members ── */}
            {team.workers?.length > 0 && (
              <div>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#737688', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:'14px' }}>person</span>
                  Team Members ({team.workers.length})
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'12px' }}>
                  {team.workers.map(w => (
                    <WorkerCard key={w.worker_id} worker={w} isLeader={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Logs */}
        {req.status_logs?.length > 0 && (
          <div style={card}>
            <h2 style={{ margin:'0 0 16px 0', fontSize:'15px', fontWeight:700, color:'#111c2d', display:'flex', alignItems:'center', gap:'8px', paddingBottom:'12px', borderBottom:'1px solid #e7eeff' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px', color:'#003ec7' }}>history</span>
              Activity Log
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {[...req.status_logs].reverse().map((log, i) => (
                <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#003ec7', marginTop:'5px', flexShrink:0 }} />
                  <div>
                    <p style={{ margin:'0 0 1px 0', fontWeight:600, fontSize:'13px', color:'#111c2d' }}>{log.status?.replace(/_/g,' ')}</p>
                    {log.remarks && <p style={{ margin:'0 0 1px 0', fontSize:'12px', color:'#434656' }}>{log.remarks}</p>}
                    <p style={{ margin:0, fontSize:'11px', color:'#737688' }}>{log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
