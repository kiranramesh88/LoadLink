import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments } from '../slice/workerSlice';
import { useNavigate } from 'react-router-dom';

const WorkHistoryPage = () => {
  const dispatch = useDispatch();
  const { assignments, assignmentsLoading } = useSelector((s) => s.worker);
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const lang = user?.language || 'en';

  useEffect(() => {
    dispatch(fetchAssignments('completed'));
  }, [dispatch]);

  const completed = assignments.filter((a) => a.assignment_status === 'completed');

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-surface-bright">
      <div className="bg-surface border-b border-outline-variant px-4 py-4">
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-on-surface">
            {lang === 'ml' ? 'ജോലി ചരിത്രം' : 'Work History'}
          </h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3" style={{ maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>
        {assignmentsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl p-4 border border-outline-variant animate-pulse h-20" />
          ))
        ) : completed.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">history</span>
            <p className="text-on-surface-variant mt-2 text-sm">
              {lang === 'ml' ? 'ചരിത്രം ഇല്ല' : 'No completed work yet'}
            </p>
          </div>
        ) : (
          completed.map((a) => (
            <div key={a.assignment_id} className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-on-surface">{a.work_title}</p>
                  <p className="text-sm text-on-surface-variant">{a.work_address || a.district || '—'}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{formatDate(a.accepted_at)}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">Completed</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => navigate(`/worker/review/${a.assignment_id}`)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                >
                  {lang === 'ml' ? 'ഉപഭോക്താവിനെ റേറ്റ് ചെയ്യുക' : 'Rate Customer'}
                </button>
                <button
                  onClick={() => navigate(`/worker/dispute/${a.assignment_id}`)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold border border-outline-variant text-on-surface-variant hover:bg-surface-container"
                >
                  {lang === 'ml' ? 'തർക്കം' : 'Dispute'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkHistoryPage;
