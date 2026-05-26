import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchCustomerRequestsApi,
    fetchRequestDetailApi,
    fetchQuestionnaireApi,
    createWorkRequestApi,
    fetchCustomerProfileApi,
    updateCustomerProfileApi,
} from '../services/customerAPI';
import toast from 'react-hot-toast';

export const fetchRequests = createAsyncThunk(
    'customer/fetchRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchCustomerRequestsApi();
            return response.data.data;
        } catch (error) {
            const msg = error.response?.data?.detail
                || error.response?.data?.message
                || 'Failed to fetch requests';
            return rejectWithValue(msg);
        }
    }
);

export const fetchRequestDetail = createAsyncThunk(
    'customer/fetchRequestDetail',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetchRequestDetailApi(id);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch request detail');
        }
    }
);

export const fetchQuestionnaire = createAsyncThunk(
    'customer/fetchQuestionnaire',
    async (workType, { rejectWithValue }) => {
        try {
            const response = await fetchQuestionnaireApi(workType);
            return response.data.data;
        } catch (error) {
            const msg = error.response?.data?.detail
                || error.response?.data?.message
                || 'Failed to fetch questionnaire';
            return rejectWithValue(msg);
        }
    }
);

export const submitWorkRequest = createAsyncThunk(
    'customer/submitWorkRequest',
    async (data, { rejectWithValue }) => {
        try {
            const response = await createWorkRequestApi(data);
            return response.data.data;
        } catch (error) {
            // DRF auth errors use 'detail', validation errors may use 'message' or 'errors'
            const msg = error.response?.data?.detail
                || error.response?.data?.message
                || (error.response?.data?.errors
                    ? JSON.stringify(error.response.data.errors)
                    : null)
                || `Request failed (${error.response?.status || 'Network Error'})`;
            return rejectWithValue(msg);
        }
    }
);

export const fetchCustomerProfile = createAsyncThunk(
    'customer/fetchCustomerProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchCustomerProfileApi();
            return response.data.data;
        } catch (error) {
            const msg = error.response?.data?.detail
                || error.response?.data?.message
                || 'Failed to fetch profile';
            return rejectWithValue(msg);
        }
    }
);

export const updateCustomerProfile = createAsyncThunk(
    'customer/updateCustomerProfile',
    async (data, { rejectWithValue }) => {
        try {
            const response = await updateCustomerProfileApi(data);
            return response.data.data;
        } catch (error) {
            const errData = error.response?.data;
            const msg = errData?.detail
                || errData?.message
                || (errData?.errors ? Object.values(errData.errors).flat().join(', ') : null)
                || 'Failed to update profile';
            return rejectWithValue(msg);
        }
    }
);

const initialState = {
    requests: [],
    loading: false,
    actionLoading: false,
    error: null,
    customerProfile: null,
    currentRequest: null,
    
    // Draft state for multi-step booking
    draftBooking: {
        work_type: null,
        questionnaire: [], // templates
        answers: {}, // form answers
        location: {
            latitude: null,
            longitude: null,
            address: '',
            district: ''
        },
        dateTime: {
            date: '',
            time: ''
        }
    }
};

const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        setDraftWorkType: (state, action) => {
            state.draftBooking.work_type = action.payload;
        },
        setDraftAnswers: (state, action) => {
            state.draftBooking.answers = {
                ...state.draftBooking.answers,
                ...action.payload
            };
        },
        setDraftLocation: (state, action) => {
            state.draftBooking.location = {
                ...state.draftBooking.location,
                ...action.payload
            };
        },
        setDraftDateTime: (state, action) => {
            state.draftBooking.dateTime = {
                ...state.draftBooking.dateTime,
                ...action.payload
            };
        },
        clearDraft: (state) => {
            state.draftBooking = initialState.draftBooking;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Requests
            .addCase(fetchRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(fetchRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            
            // Fetch Request Detail
            .addCase(fetchRequestDetail.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRequestDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.currentRequest = action.payload;
            })
            .addCase(fetchRequestDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })

            // Fetch Questionnaire
            .addCase(fetchQuestionnaire.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchQuestionnaire.fulfilled, (state, action) => {
                state.loading = false;
                state.draftBooking.questionnaire = action.payload;
            })
            .addCase(fetchQuestionnaire.rejected, (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            // Submit Request
            .addCase(submitWorkRequest.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(submitWorkRequest.fulfilled, (state, action) => {
                state.actionLoading = false;
                if (action.payload) {
                    state.requests.unshift(action.payload);
                }
                // Clear the draft after successful submission
                state.draftBooking = initialState.draftBooking;
            })
            .addCase(submitWorkRequest.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Fetch Customer Profile
            .addCase(fetchCustomerProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.customerProfile = action.payload;
            })
            .addCase(fetchCustomerProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Customer Profile
            .addCase(updateCustomerProfile.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(updateCustomerProfile.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.customerProfile = action.payload;
                toast.success('Profile updated successfully!');
            })
            .addCase(updateCustomerProfile.rejected, (state, action) => {
                state.actionLoading = false;
                const msg = typeof action.payload === 'object'
                    ? Object.values(action.payload).flat().join(', ')
                    : action.payload;
                toast.error(msg || 'Failed to update profile');
            });
    }
});

export const {
    setDraftWorkType,
    setDraftAnswers,
    setDraftLocation,
    setDraftDateTime,
    clearDraft
} = customerSlice.actions;

export default customerSlice.reducer;
