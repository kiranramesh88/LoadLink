import api from '../../../api/axiosInstance';

const WS_BASE = 'ws://127.0.0.1:8000';
export { WS_BASE };

// ── Dashboard ─────────────────────────────────────────────
export const fetchUnionDashboardApi  = () => api.get('/work-requests/union/dashboard/');

// ── Requests ──────────────────────────────────────────────
export const fetchUnionRequestsApi   = (params = {}) => api.get('/work-requests/union/requests/', { params });
export const fetchRequestDetailApi   = (id)          => api.get(`/work-requests/${id}/`);

// ── Team ──────────────────────────────────────────────────
export const generateTeamApi         = (id)          => api.post(`/work-requests/${id}/generate-team/`);
export const confirmTeamApi          = (id)          => api.post(`/work-requests/${id}/confirm-team/`);

// ── Status ────────────────────────────────────────────────
export const updateRequestStatusApi  = (id, status, remarks = '') =>
  api.post(`/work-requests/${id}/update-status/`, { status, remarks });

// ── Disputes ──────────────────────────────────────────────
export const fetchUnionDisputesApi   = ()              => api.get('/work-requests/union/disputes/');
export const resolveDisputeApi       = (disputeId, resolution_notes) =>
  api.post(`/work-requests/disputes/${disputeId}/resolve/`, { resolution_notes });
