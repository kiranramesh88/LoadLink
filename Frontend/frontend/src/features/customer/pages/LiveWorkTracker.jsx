import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequestDetail } from '../slice/customerSlice';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import useNotificationSocket from '../../../hooks/useNotificationSocket';

const WS_BASE = 'ws://127.0.0.1:8000';

const STATUS_STEPS = [
  { key: 'created',          label: 'Request Submitted',      icon: 'assignment_turned_in', desc: 'Your request is being processed.' },
  { key: 'team_suggested',   label: 'Team Assigned',          icon: 'groups',               desc: 'A team has been suggested.' },
  { key: 'workers_assigned', label: 'Workers Confirmed',      icon: 'badge',                desc: 'Workers confirmed and heading over.' },
  { key: 'in_progress',      label: 'Work In Progress',       icon: 'construction',         desc: 'Your team is on-site and working.' },
  { key: 'completed',        label: 'Work Completed',         icon: 'task_alt',             desc: 'Work has been marked done.' },
];

const getStepIndex = (status) => {
  const map = {
    created: 0, pending: 0,
    team_suggested: 1, approved: 1,
    workers_assigned: 2, workers_on_the_way: 2, workers_arrived: 2,
    in_progress: 3,
    work_completion_pending: 4, completed: 4, payment_pending: 4,
  };
  return map[status] ?? 0;
};

const WORK_LABELS = {
  shop_unloading: 'Shop / Textile Unloading',
  market_loading: 'Vegetable Market Loading',
  household_shifting: 'Household Shifting',
  construction: 'Construction Material',
  warehouse: 'Wholesale / Warehouse',
  other: 'Other Labor',
};

export default function LiveWorkTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRequest, loading } = useSelector((s) => s.customer);

  const [workerLocations, setWorkerLocations] = useState({});
  const [wsStatus, setWsStatus] = useState('connecting');
  const [confirming, setConfirming] = useState(false);
  const [startingWork, setStartingWork] = useState(false);
  const [markingArrived, setMarkingArrived] = useState(false);
  const [showArrivedPopup, setShowArrivedPopup] = useState(true);
  const wsRef = useRef(null);

  // Fetch request detail
  useEffect(() => {
    if (id) dispatch(fetchRequestDetail(id));
  }, [id, dispatch]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(() => { if (id) dispatch(fetchRequestDetail(id)); }, 30000);
    return () => clearInterval(t);
  }, [id, dispatch]);

  // WebSocket live tracking
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`${WS_BASE}/ws/live-tracking/${id}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setWsStatus('connected');
    ws.onclose = () => setWsStatus('disconnected');
    ws.onerror = () => setWsStatus('error');
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.worker_id && data.latitude && data.longitude) {
          setWorkerLocations((prev) => ({
            ...prev,
            [data.worker_id]: { lat: data.latitude, lng: data.longitude },
          }));
        }
      } catch {}
    };

    return () => ws.close();
  }, [id]);

  // Handle real-time status updates via WebSocket
  useNotificationSocket(useCallback((event) => {
    if (event.type === 'work_status_update' && event.data?.work_request_id === id) {
      dispatch(fetchRequestDetail(id));
      if (event.data?.status === 'workers_arrived') {
        setShowArrivedPopup(true);
      }
      toast.success(event.message || `Work status updated to ${event.data.status?.replace(/_/g, ' ')}`);
    }
  }, [id, dispatch]));

  const handleStartWork = useCallback(async () => {
    setStartingWork(true);
    try {
      await api.post(`/work-requests/${id}/update-status/`, {
        status: 'in_progress',
        remarks: 'Customer started work session.'
      });
      toast.success('Work started successfully!');
      dispatch(fetchRequestDetail(id));
      setShowArrivedPopup(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Failed to start work');
    } finally {
      setStartingWork(false);
    }
  }, [id, dispatch]);

  const handleMarkArrived = useCallback(async () => {
    setMarkingArrived(true);
    try {
      await api.post(`/work-requests/${id}/mark-arrived/`);
      toast.success('Workers marked as arrived!');
      dispatch(fetchRequestDetail(id));
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Failed to update status');
    } finally {
      setMarkingArrived(false);
    }
  }, [id, dispatch]);

  const handleConfirmCompletion = useCallback(async () => {
    setConfirming(true);
    try {
      await api.post(`/work-requests/${id}/confirm-completion/`);
      toast.success('Work confirmed! Proceeding to payment.');
      navigate(`/customer/payment/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Failed to confirm completion');
    } finally {
      setConfirming(false);
    }
  }, [id, navigate]);

  const handleDispute = useCallback(async () => {
    const reason = window.prompt('Briefly describe the issue:');
    if (!reason) return;
    try {
      await api.post(`/work-requests/${id}/dispute/`, { reason });
      toast.success('Dispute filed. Our team will review it.');
      dispatch(fetchRequestDetail(id));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to file dispute');
    }
  }, [id, dispatch]);

  if (loading && !currentRequest) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface-variant font-medium">Loading tracker...</p>
        </div>
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="flex h-screen items-center justify-center bg-background flex-col gap-4">
        <span className="material-symbols-outlined text-[56px] text-on-surface-variant">search_off</span>
        <p className="text-on-surface font-semibold text-lg">Request not found</p>
        <button onClick={() => navigate('/customer/dashboard')} className="px-5 py-2 bg-primary text-on-primary rounded-lg font-semibold">Back to Dashboard</button>
      </div>
    );
  }

  const { status, work_type, assigned_team, work_address, district, estimated_price, estimated_workers, scheduled_date, scheduled_time, status_logs } = currentRequest;
  const stepIndex = getStepIndex(status);

  // Map center: use first worker location or fallback to request coords
  const firstWorker = Object.values(workerLocations)[0];
  const mapLat = Number(firstWorker?.lat ?? currentRequest.latitude ?? 10.52);
  const mapLng = Number(firstWorker?.lng ?? currentRequest.longitude ?? 76.21);

  const teamLeader = assigned_team?.team_leader;
  const totalWorkers = assigned_team?.total_workers ?? estimated_workers;

  const isCompletionPending = status === 'work_completion_pending';
  const isInProgress = status === 'in_progress' || status === 'workers_assigned' || status === 'workers_on_the_way';

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-[Inter,sans-serif]">

      {/* ── LEFT: Map ── */}
      <div className="hidden lg:flex flex-col flex-1 relative">
        {/* Map iframe */}
        {(!isNaN(mapLat) && !isNaN(mapLng) && mapLat !== null && mapLng !== null) ? (
          <iframe
            key={`${mapLat}-${mapLng}`}
            title="Live Map"
            width="100%"
            height="100%"
            frameBorder="0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - 0.008},${mapLat - 0.008},${mapLng + 0.008},${mapLat + 0.008}&layer=mapnik&marker=${mapLat},${mapLng}`}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-variant text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">location_off</span>
            <p>Live map unavailable</p>
          </div>
        )}

        {/* WS status badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-outline-variant text-label-sm">
          <span className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-secondary animate-pulse' : wsStatus === 'connecting' ? 'bg-tertiary' : 'bg-error'}`} />
          {wsStatus === 'connected' ? 'Live Tracking' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}
        </div>

        {/* Worker count badge */}
        {Object.keys(workerLocations).length > 0 && (
          <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1.5 rounded-full text-label-sm font-bold shadow">
            <span className="material-symbols-outlined text-[14px] mr-1">location_on</span>
            {Object.keys(workerLocations).length} Worker{Object.keys(workerLocations).length > 1 ? 's' : ''} tracked
          </div>
        )}
      </div>

      {/* ── RIGHT: Details Panel ── */}
      <div className="w-full lg:w-[420px] shrink-0 flex flex-col h-full bg-surface-container-lowest border-l border-outline-variant overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-outline-variant bg-surface-container-lowest">
          <button onClick={() => navigate('/customer/dashboard')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-title-lg font-bold text-on-surface truncate">
              {WORK_LABELS[work_type] || work_type?.replace(/_/g, ' ').toUpperCase()}
            </h1>
            <p className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {district || work_address || 'Location set'}
            </p>
          </div>
          <div className="shrink-0 px-2 py-1 rounded-md bg-primary-container text-on-primary-container text-label-sm font-bold uppercase">
            {status?.replace(/_/g, ' ')}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Mobile Map */}
          <div className="w-full h-48 md:h-64 bg-surface-variant rounded-xl overflow-hidden shadow-inner mb-6 relative">
            {(!isNaN(mapLat) && !isNaN(mapLng) && mapLat !== null && mapLng !== null) ? (
              <iframe
                key={`m-${mapLat}-${mapLng}`}
                title="Live Map Mobile"
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - 0.008},${mapLat - 0.008},${mapLng + 0.008},${mapLat + 0.008}&layer=mapnik&marker=${mapLat},${mapLng}`}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-surface-variant text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] mb-2 opacity-50">location_off</span>
                <p className="text-sm">Map unavailable</p>
              </div>
            )}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-surface-container-lowest/90 backdrop-blur px-2 py-1 rounded-full text-label-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${wsStatus === 'connected' ? 'bg-secondary animate-pulse' : 'bg-error'}`} />
              {wsStatus === 'connected' ? 'Live' : 'Offline'}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="p-5 border-b border-outline-variant">
            <h2 className="text-label-md font-bold text-on-surface-variant uppercase tracking-widest mb-4">Operation Status</h2>
            <div className="flex flex-col gap-0 relative">
              <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-outline-variant/40" />
              {STATUS_STEPS.map((step, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <div key={step.key} className="flex gap-3 relative py-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 transition-all ${done ? 'bg-primary text-on-primary' : active ? 'bg-primary-container border-2 border-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      {done ? (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      ) : active ? (
                        <span className="w-2 h-2 rounded-full bg-primary block" />
                      ) : null}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className={`text-label-md font-bold ${done || active ? 'text-on-surface' : 'text-on-surface-variant'}`}>{step.label}</p>
                      {active && <p className="text-label-sm text-on-surface-variant mt-0.5">{step.desc}</p>}
                    </div>
                    {active && (
                      <div className="shrink-0 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Details */}
          {assigned_team && (
            <div className="p-5 border-b border-outline-variant">
              <h2 className="text-label-md font-bold text-on-surface-variant uppercase tracking-widest mb-3">Assigned Team</h2>
              {teamLeader && (
                <div className="flex items-center gap-3 mb-3 p-3 bg-surface-container rounded-xl border border-outline-variant">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {teamLeader?.user?.full_name?.charAt(0) || 'L'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-sm text-primary font-bold uppercase tracking-wide">Team Lead</p>
                    <p className="text-body-md font-semibold text-on-surface">{teamLeader?.user?.full_name || 'Team Leader'}</p>
                    <p className="text-label-sm text-on-surface-variant">{teamLeader?.user?.phone_number}</p>
                  </div>
                  <a href={`tel:${teamLeader?.user?.phone_number}`} className="w-10 h-10 rounded-full bg-secondary-container text-secondary flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-on-surface-variant text-label-sm">
                <span className="material-symbols-outlined text-[16px]">group</span>
                <span>{totalWorkers ?? estimated_workers} worker{(totalWorkers ?? estimated_workers) !== 1 ? 's' : ''} assigned</span>
              </div>
            </div>
          )}

          {/* Job Info */}
          <div className="p-5 border-b border-outline-variant">
            <h2 className="text-label-md font-bold text-on-surface-variant uppercase tracking-widest mb-3">Job Details</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'calendar_today', label: 'Scheduled', value: scheduled_date || 'TBD' },
                { icon: 'schedule', label: 'Time', value: scheduled_time || 'TBD' },
                { icon: 'group', label: 'Workers', value: `${estimated_workers || '—'} persons` },
                { icon: 'payments', label: 'Estimate', value: estimated_price ? `₹${parseFloat(estimated_price).toFixed(0)}` : '—' },
              ].map(item => (
                <div key={item.label} className="bg-surface-container rounded-lg p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                    <span className="text-label-sm">{item.label}</span>
                  </div>
                  <p className="text-body-md font-bold text-on-surface">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Status Logs */}
          {status_logs?.length > 0 && (
            <div className="p-5">
              <h2 className="text-label-md font-bold text-on-surface-variant uppercase tracking-widest mb-3">Activity Log</h2>
              <div className="flex flex-col gap-2">
                {[...status_logs].reverse().slice(0, 4).map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">fiber_manual_record</span>
                    <div>
                      <span className="font-semibold text-on-surface">{log.status?.replace(/_/g, ' ')}</span>
                      {log.remarks && <span className="text-on-surface-variant"> — {log.remarks}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Area */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
          {isCompletionPending ? (
            <div className="flex flex-col gap-3">
              <div className="bg-primary-container/30 border border-primary-container rounded-lg p-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
                <p className="text-label-sm text-on-surface">The team leader has marked this work as <strong>complete</strong>. Please confirm to proceed with payment.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmCompletion}
                  disabled={confirming}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {confirming ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                  {confirming ? 'Confirming...' : 'Confirm & Pay'}
                </button>
                <button
                  onClick={handleDispute}
                  className="px-4 py-3 bg-error-container text-error rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                  Dispute
                </button>
              </div>
            </div>
          ) : status === 'workers_arrived' ? (
            <div className="flex gap-3">
              <button
                onClick={handleStartWork}
                disabled={startingWork}
                className="flex-1 py-3.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {startingWork ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[20px]">play_circle</span>
                )}
                {startingWork ? 'Starting...' : 'Start Work'}
              </button>
              <button
                onClick={handleDispute}
                className="px-4 py-3 bg-error-container text-error rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-1 text-label-md"
              >
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                Dispute
              </button>
            </div>
          ) : status === 'workers_on_the_way' ? (
            <div className="flex gap-3">
              <button
                onClick={handleMarkArrived}
                disabled={markingArrived}
                className="flex-1 py-3.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {markingArrived ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                )}
                {markingArrived ? 'Updating...' : 'Workers Arrived'}
              </button>
              <button
                onClick={handleDispute}
                className="px-4 py-3 bg-error-container text-error rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-1 text-label-md"
              >
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                Dispute
              </button>
            </div>
          ) : isInProgress ? (
            <div className="flex gap-3">
              <div className="flex-1 bg-surface-container py-3 px-4 rounded-xl border border-outline-variant flex flex-col justify-center">
                <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">Est. Total</span>
                <span className="text-title-lg font-bold text-on-surface">₹{estimated_price ? parseFloat(estimated_price).toFixed(0) : '—'}</span>
              </div>
              <button onClick={handleDispute} className="px-4 py-3 bg-error-container text-error rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-1 text-label-md">
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                Dispute
              </button>
            </div>
          ) : status === 'payment_pending' ? (
            <button onClick={() => navigate(`/customer/payment/${id}`)} className="w-full py-3.5 bg-secondary text-on-secondary rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-[20px]">payments</span>
              Review &amp; Pay
            </button>
          ) : (
            <div className="flex items-center gap-2 justify-center py-2 text-on-surface-variant text-label-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Waiting for team assignment...
            </div>
          )}
        </div>
      </div>

      {/* Workers Arrived Modal Popup */}
      {status === 'workers_arrived' && showArrivedPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden animate-in slide-in-from-bottom-4 p-6 text-center" style={{ maxWidth: "400px", boxSizing: "border-box" }}>
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                location_on
              </span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Workers Reached Location!</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              The workers have arrived at the job site. Please click the button below to start the work.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleStartWork}
                disabled={startingWork}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg"
              >
                {startingWork ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[20px]">play_circle</span>
                )}
                {startingWork ? 'Starting...' : 'Start Work'}
              </button>
              <button
                onClick={() => setShowArrivedPopup(false)}
                className="w-full py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-colors"
              >
                View Map / Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
