import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUnionDashboardApi, fetchUnionRequestsApi } from '../services/unionAPI';
import toast from 'react-hot-toast';

const WORK_LABELS = {
  shop_unloading:'Shop / Textile Unloading', market_loading:'Vegetable Market Loading',
  household_shifting:'Household Shifting', construction:'Construction Material',
  warehouse:'Wholesale / Warehouse', other:'Other Labor',
};

const STATUS_COLOR = {
  pending:          'bg-amber-100 text-amber-700',
  union_review:     'bg-purple-100 text-purple-700',
  team_suggested:   'bg-teal-100 text-teal-700',
  team_confirmed:   'bg-teal-100 text-teal-700',
  workers_assigned: 'bg-blue-100 text-blue-700',
  workers_on_the_way:'bg-blue-100 text-blue-700',
  in_progress:      'bg-emerald-100 text-emerald-700',
  work_completion_pending:'bg-orange-100 text-orange-700',
  payment_pending:  'bg-orange-100 text-orange-700',
  completed:        'bg-emerald-100 text-emerald-700',
  cancelled:        'bg-red-100 text-red-700',
  disputed:         'bg-red-100 text-red-700',
};

const UnionDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, reqRes] = await Promise.all([
        fetchUnionDashboardApi(),
        fetchUnionRequestsApi(),
      ]);
      setStats(dashRes.data?.data || dashRes.data || {});
      setRequests(reqRes.data?.data || []);
    } catch (e) {
      if (e.response?.status !== 401) toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derived counts from actual request list
  const pendingCount  = requests.filter(r => ['pending','union_review'].includes(r.status)).length;
  const activeCount   = requests.filter(r => ['workers_assigned','workers_on_the_way','workers_arrived','in_progress'].includes(r.status)).length;
  const disputeCount  = requests.filter(r => r.status === 'disputed').length;

  const recentRequests = [...requests].slice(0, 6);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time overview of your union's work requests and labor deployment.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium flex items-center gap-2 text-sm shadow-sm">
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards — real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label:'Total Requests',   value: requests.length,                 icon:'assignment',       color:'blue' },
          { label:'Pending / Review', value: pendingCount,                    icon:'assignment_late',  color:'amber' },
          { label:'Active Operations',value: activeCount,                     icon:'engineering',      color:'emerald' },
          { label:'Open Disputes',    value: disputeCount,                    icon:'gavel',            color:'red' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 text-${stat.color}-600 flex items-center justify-center`}>
              <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? '—' : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Recent Work Requests</h2>
            <Link to="/union/requests" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : recentRequests.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">inbox</span>
              <p className="text-slate-500 font-medium">No requests assigned to your union yet</p>
              <p className="text-slate-400 text-sm mt-1">Requests will appear here once matched to your union.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="p-4">Work Type</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4 text-center">Workers</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRequests.map((req) => {
                    const isTeamable = ['pending','union_review'].includes(req.status);
                    const statusCls = STATUS_COLOR[req.status] || 'bg-slate-100 text-slate-700';
                    return (
                      <tr key={req.request_id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-slate-900 text-sm">{WORK_LABELS[req.work_type] || req.work_type}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{req.district || '—'}</p>
                        </td>
                        <td className="p-4 text-sm text-slate-700">
                          {req.customer?.full_name || '—'}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
                            {req.estimated_workers ?? '—'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusCls}`}>
                            {req.status?.replace(/_/g,' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          {isTeamable ? (
                            <button onClick={() => navigate(`/union/requests/${req.request_id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Assign Team
                            </button>
                          ) : (
                            <button onClick={() => navigate(`/union/requests/${req.request_id}`)}
                              className="text-slate-400 hover:text-slate-600 text-sm font-medium">
                              Manage
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Nav shortcuts */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label:'All Requests',  path:'/union/requests',     icon:'assignment',   badge: requests.length },
                { label:'Active Works',  path:'/union/active-works', icon:'construction', badge: activeCount },
                { label:'Disputes',      path:'/union/disputes',     icon:'gavel',        badge: disputeCount },
              ].map(q => (
                <Link key={q.path} to={q.path}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-blue-600 transition-colors">{q.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{q.label}</span>
                  </div>
                  {q.badge != null && (
                    <span className="min-w-[22px] h-[22px] rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center px-1">
                      {q.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Pending team actions */}
          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-lg">assignment_late</span>
                Needs Attention
              </h3>
              <div className="space-y-2">
                {requests.filter(r => ['pending','union_review'].includes(r.status)).slice(0,3).map(r => (
                  <button key={r.request_id} onClick={() => navigate(`/union/requests/${r.request_id}`)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-amber-100 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{WORK_LABELS[r.work_type] || r.work_type}</p>
                      <p className="text-xs text-slate-500">{r.district || '—'} · {r.estimated_workers ?? '—'} workers</p>
                    </div>
                    <span className="material-symbols-outlined text-amber-500 text-sm">chevron_right</span>
                  </button>
                ))}
              </div>
              <Link to="/union/requests" className="block text-center text-xs text-blue-600 font-semibold mt-3 hover:underline">
                View all {pendingCount} pending →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnionDashboard;
