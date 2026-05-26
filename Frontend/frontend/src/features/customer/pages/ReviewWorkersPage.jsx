import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchRequestDetailApi, submitWorkerReviewApi } from '../services/customerAPI';

function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button type="button" key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none">
          <span className="material-symbols-outlined text-[32px] transition-colors"
            style={{
              color: (hovered || value) >= star ? '#f59e0b' : '#d1d5db',
              fontVariationSettings: (hovered || value) >= star ? "'FILL' 1" : "'FILL' 0",
            }}>star</span>
        </button>
      ))}
    </div>
  );
}

export default function ReviewWorkersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [work, setWork]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({});   // worker_id → { rating, comment }
  const [submitted, setSubmitted] = useState({}); // worker_id → true
  const [submitting, setSubmitting] = useState(null); // worker_id currently submitting

  const load = useCallback(async () => {
    try {
      const res = await fetchRequestDetailApi(id);
      const data = res.data?.data || res.data;
      setWork(data);
      // Initialize review state for each worker
      const init = {};
      data?.assigned_team?.workers?.forEach(w => {
        init[w.worker_id] = { rating: 5, comment: '' };
      });
      if (data?.assigned_team?.team_leader) {
        init[data.assigned_team.team_leader.worker_id] = { rating: 5, comment: '' };
      }
      setReviews(init);
    } catch {
      toast.error('Failed to load work details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSubmitReview = async (workerId, isLeader) => {
    const r = reviews[workerId];
    if (!r?.rating) { toast.error('Please select a rating'); return; }

    setSubmitting(workerId);
    try {
      await submitWorkerReviewApi(id, {
        worker_id: workerId,
        rating: r.rating,
        comment: r.comment,
      });
      setSubmitted(prev => ({ ...prev, [workerId]: true }));
      toast.success(`Review submitted for ${isLeader ? 'Team Leader' : 'worker'}!`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const team   = work?.assigned_team;
  const leader = team?.team_leader;
  const workers = team?.workers || [];
  const allWorkers = [
    ...(leader ? [{ ...leader, _isLeader: true }] : []),
    ...workers.map(w => ({ ...w, _isLeader: false })),
  ];

  const allDone = allWorkers.length > 0 && allWorkers.every(w => submitted[w.worker_id]);

  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,sans-serif] pb-10">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3" style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Rate Workers</h1>
            <p className="text-xs text-slate-500">Your feedback improves our service quality.</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-5" style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Work info */}
        {work && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-500 text-[22px]"
              style={{ fontVariationSettings:"'FILL' 1" }}>star</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{work.title}</p>
              <p className="text-xs text-slate-500">{work.district} · {work.scheduled_date}</p>
            </div>
          </div>
        )}

        {/* No team */}
        {allWorkers.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">group_off</span>
            <p className="text-slate-500">No workers assigned to review.</p>
          </div>
        )}

        {/* Worker review cards */}
        {allWorkers.map(worker => {
          const rev  = reviews[worker.worker_id] || { rating: 5, comment: '' };
          const done = submitted[worker.worker_id];
          const busy = submitting === worker.worker_id;

          return (
            <div key={worker.worker_id}
              className={`bg-white rounded-xl border-2 overflow-hidden
                ${done ? 'border-amber-300' : 'border-slate-200'}`}>

              {/* Worker header */}
              <div className={`px-5 py-4 flex items-center gap-3 ${worker._isLeader ? 'bg-blue-50 border-b border-blue-100' : 'bg-slate-50 border-b border-slate-100'}`}>
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shrink-0
                  ${worker._isLeader ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {worker.full_name?.charAt(0) || 'W'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm truncate">{worker.full_name || '—'}</p>
                    {worker._isLeader && (
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        ⭐ Leader
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{worker.phone_number || '—'}</p>
                  <p className="text-xs text-slate-400">{worker.experience_years ?? 0} yrs experience</p>
                </div>
                {done && (
                  <span className="material-symbols-outlined text-amber-500 text-[24px]"
                    style={{ fontVariationSettings:"'FILL' 1" }}>verified</span>
                )}
              </div>

              {/* Review form */}
              {!done ? (
                <div className="px-5 py-4 space-y-4">
                  {/* Stars */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Rating</p>
                    <StarSelector
                      value={rev.rating}
                      onChange={val => setReviews(prev => ({
                        ...prev,
                        [worker.worker_id]: { ...prev[worker.worker_id], rating: val }
                      }))}
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Comment (optional)</p>
                    <textarea
                      value={rev.comment}
                      onChange={e => setReviews(prev => ({
                        ...prev,
                        [worker.worker_id]: { ...prev[worker.worker_id], comment: e.target.value }
                      }))}
                      placeholder="How was the service? Any specific feedback?"
                      rows={3}
                      className="w-full text-sm text-slate-700 border border-slate-200 rounded-xl p-3 resize-none outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    onClick={() => handleSubmitReview(worker.worker_id, worker._isLeader)}
                    disabled={busy}
                    className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2">
                    {busy
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <span className="material-symbols-outlined text-[18px]">star</span>}
                    Submit Review
                  </button>
                </div>
              ) : (
                <div className="px-5 py-4 flex items-center gap-3 bg-amber-50">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="material-symbols-outlined text-[18px]"
                        style={{ color: s <= rev.rating ? '#f59e0b' : '#d1d5db', fontVariationSettings:"'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-amber-800">Review submitted!</p>
                </div>
              )}
            </div>
          );
        })}

        {/* All done CTA */}
        {allDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-5xl text-emerald-500 block mb-2"
              style={{ fontVariationSettings:"'FILL' 1" }}>reviews</span>
            <p className="text-lg font-bold text-emerald-900">All reviews submitted!</p>
            <p className="text-sm text-emerald-700 mt-1">Thank you for your valuable feedback.</p>
            <button onClick={() => navigate('/customer/history')}
              className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700">
              View History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
