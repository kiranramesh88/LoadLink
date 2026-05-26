import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as unionAPI from '../services/unionAPI';

// Thunks
export const fetchDashboardData = createAsyncThunk(
  'union/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await unionAPI.fetchUnionDashboardApi();
      return res.data?.data || res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRequests = createAsyncThunk(
  'union/fetchRequests',
  async (_, { rejectWithValue }) => {
    try {
      const res = await unionAPI.fetchUnionRequestsApi();
      return res.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  dashboardStats: {
    activeShifts: 0,
    pendingRequests: 0,
    workersOnSite: 0,
    dailySpend: 0,
  },
  activeRequests: [],
  suggestedTeam: null,
  loading: false,
  error: null,
};

const unionSlice = createSlice({
  name: 'union',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSuggestedTeam: (state, action) => {
      state.suggestedTeam = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.activeRequests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSuggestedTeam } = unionSlice.actions;

export default unionSlice.reducer;
