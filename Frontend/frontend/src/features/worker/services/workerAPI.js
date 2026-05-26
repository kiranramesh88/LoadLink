import api from '../../../api/axiosInstance';

const WS_BASE = "ws://127.0.0.1:8000";

export { WS_BASE };

// ====================================================
// PROFILE & AVAILABILITY
// ====================================================
export const getWorkerProfileApi = () => api.get("/accounts/worker/profile/");
export const updateAvailabilityApi = (availability_status) =>
  api.patch("/accounts/worker/update-availability/", { availability_status });
export const updateProfileApi = (data) => api.put("/accounts/update-profile/", data);
export const getCurrentUserApi = () => api.get("/accounts/me/");

// ====================================================
// ASSIGNMENTS
// ====================================================
export const getAssignmentsApi = (status) =>
  api.get(`/work-requests/my-assignments/${status ? `?status=${status}` : ""}`);

export const getWorkDetailApi = (requestId) =>
  api.get(`/work-requests/${requestId}/`);

export const acceptAssignmentApi = (assignmentId) =>
  api.post(`/work-requests/assignments/${assignmentId}/accept/`);

export const rejectAssignmentApi = (assignmentId) =>
  api.post(`/work-requests/assignments/${assignmentId}/reject/`);

// ====================================================
// WORK LIFECYCLE (Team Leader Only)
// ====================================================
export const markOnTheWayApi = (requestId) =>
  api.post(`/work-requests/${requestId}/on-the-way/`);

export const confirmWorkStartApi = (requestId) =>
  api.post(`/work-requests/${requestId}/confirm-work-start/`);

export const uploadEvidenceApi = (requestId, formData) =>
  api.post(`/work-requests/${requestId}/upload-completion-evidence/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const markCompletedApi = (requestId) =>
  api.post(`/work-requests/${requestId}/mark-completed/`);

// ====================================================
// PAYMENT CONFIRMATION
// ====================================================
export const confirmCashPaidApi = (requestId) =>
  api.post(`/work-requests/${requestId}/confirm-cash-paid/`);

export const confirmCashReceivedApi = (requestId) =>
  api.post(`/work-requests/${requestId}/confirm-cash-received/`);

// ====================================================
// LOCATION
// ====================================================
export const updateLocationApi = (latitude, longitude) =>
  api.patch("/accounts/update-location/", { current_latitude: latitude, current_longitude: longitude });


// ====================================================
// WALLET & FINANCE
// ====================================================
export const getWalletApi = () => api.get("/finance/wallet/");
export const getTransactionsApi = () => api.get("/finance/wallet/transactions/");
export const createWithdrawalApi = (data) => api.post("/finance/withdrawals/create/", data);
export const getWithdrawalsApi = () => api.get("/finance/withdrawals/my/");
export const createSettlementApi = (data) => api.post("/finance/settlements/create/", data);

// ====================================================
// NOTIFICATIONS
// ====================================================
export const getNotificationsApi = () => api.get("/notifications/my-notifications/");
export const markNotificationReadApi = (id) => api.post(`/notifications/${id}/mark-read/`);

// ====================================================
// DISPUTES
// ====================================================
export const createDisputeApi = (requestId, reason) =>
  api.post(`/work-requests/${requestId}/dispute/`, { reason });

// ====================================================
// REVIEWS
// ====================================================
export const submitCustomerReviewApi = (requestId, data) =>
  api.post(`/work-requests/${requestId}/review-customer/`, data);
