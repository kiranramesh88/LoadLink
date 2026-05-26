import api from '../../../api/axiosInstance';

// ======================================
// PROFILE
// ======================================

export const fetchCustomerProfileApi = async () =>
    api.get('/accounts/customer/profile/');

export const updateCustomerProfileApi = async (data) =>
    api.put('/accounts/customer/profile/', data);

export const fetchCurrentUserApi = async () =>
    api.get('/accounts/me/');

// ======================================
// WORK REQUESTS
// ======================================

export const fetchCustomerRequestsApi = async () =>
    api.get('/work-requests/my-requests/');

export const fetchRequestDetailApi = async (id) =>
    api.get(`/work-requests/${id}/`);

export const fetchQuestionnaireApi = async (workType) =>
    api.get(`/work-requests/questionnaire/?work_type=${workType}`);

export const createWorkRequestApi = async (data) =>
    api.post('/work-requests/create/', data);

// ======================================
// PAYMENT
// ======================================

export const createPaymentOrderApi = async (id) =>
    api.post(`/work-requests/payments/create-order/${id}/`, {});

export const verifyPaymentApi = async (data) =>
    api.post('/work-requests/payments/verify/', data);

export const confirmCashPaidApi = async (id) =>
    api.post(`/work-requests/${id}/confirm-cash-paid/`, {});

export const confirmWorkCompletionApi = async (id) =>
    api.post(`/work-requests/${id}/confirm-completion/`, {});

// ======================================
// DISPUTE
// ======================================

export const createDisputeApi = async (id, data) =>
    api.post(`/work-requests/${id}/dispute/`, data);

// ======================================
// REVIEWS
// ======================================

export const submitWorkerReviewApi = async (id, data) =>
    api.post(`/work-requests/${id}/review-worker/`, data);

export const submitCustomerReviewApi = async (id, data) =>
    api.post(`/work-requests/${id}/review-customer/`, data);
