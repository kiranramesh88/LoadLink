import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { loginSuccess } from "../../auth/slice/authSlice";
import {
  getWorkerProfileApi,
  updateAvailabilityApi,
  updateProfileApi,
  getAssignmentsApi,
  getWorkDetailApi,
  acceptAssignmentApi,
  rejectAssignmentApi,
  markOnTheWayApi,
  confirmWorkStartApi,
  uploadEvidenceApi,
  markCompletedApi,
  confirmCashPaidApi,
  confirmCashReceivedApi,
  getWalletApi,
  getTransactionsApi,
  createWithdrawalApi,
  getWithdrawalsApi,
  getNotificationsApi,
  markNotificationReadApi,
  createDisputeApi,
  submitCustomerReviewApi,
} from "../services/workerAPI";

// ====================================================
// THUNKS
// ====================================================

export const fetchDashboardData = createAsyncThunk(
  "worker/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const [profileRes, assignmentsRes] = await Promise.all([
        getWorkerProfileApi(),
        getAssignmentsApi(),
      ]);
      const assignments = assignmentsRes.data.data || assignmentsRes.data.results || [];
      const activeWork = assignments.find(
        (a) => a.assignment_status === "in_progress" || 
               a.assignment_status === "accepted" ||
               (a.assignment_status === "completed" && a.work_status !== "completed")
      ) || null;
      return {
        profile: profileRes.data.data,
        assignments,
        activeWork,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchWallet = createAsyncThunk(
  "worker/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getWalletApi();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  "worker/fetchTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getTransactionsApi();
      return res.data.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchWithdrawals = createAsyncThunk(
  "worker/fetchWithdrawals",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getWithdrawalsApi();
      return res.data.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchAssignments = createAsyncThunk(
  "worker/fetchAssignments",
  async (status, { rejectWithValue }) => {
    try {
      const res = await getAssignmentsApi(status);
      const data = res.data.data || res.data.results || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchWorkDetail = createAsyncThunk(
  "worker/fetchWorkDetail",
  async (requestId, { rejectWithValue }) => {
    try {
      const res = await getWorkDetailApi(requestId);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const updateAvailabilityStatus = createAsyncThunk(
  "worker/updateAvailabilityStatus",
  async (status, { rejectWithValue }) => {
    try {
      const res = await updateAvailabilityApi(status);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const acceptAssignment = createAsyncThunk(
  "worker/acceptAssignment",
  async (assignmentId, { rejectWithValue, dispatch }) => {
    try {
      await acceptAssignmentApi(assignmentId);
      toast.success("Assignment accepted!");
      dispatch(fetchAssignments());
      dispatch(setIncomingAssignment(null));
    } catch (err) {
      toast.error("Failed to accept assignment");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const rejectAssignment = createAsyncThunk(
  "worker/rejectAssignment",
  async (assignmentId, { rejectWithValue, dispatch }) => {
    try {
      await rejectAssignmentApi(assignmentId);
      toast.success("Assignment rejected");
      dispatch(fetchAssignments());
      dispatch(setIncomingAssignment(null));
    } catch (err) {
      toast.error("Failed to reject assignment");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const markOnTheWay = createAsyncThunk(
  "worker/markOnTheWay",
  async (requestId, { rejectWithValue, dispatch }) => {
    try {
      await markOnTheWayApi(requestId);
      toast.success("Status updated: On the way");
      dispatch(fetchWorkDetail(requestId));
    } catch (err) {
      toast.error("Failed to update status");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const confirmWorkStart = createAsyncThunk(
  "worker/confirmWorkStart",
  async (requestId, { rejectWithValue, dispatch }) => {
    try {
      await confirmWorkStartApi(requestId);
      toast.success("Work started!");
      dispatch(fetchWorkDetail(requestId));
    } catch (err) {
      toast.error("Failed to confirm work start");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const uploadEvidence = createAsyncThunk(
  "worker/uploadEvidence",
  async ({ requestId, formData }, { rejectWithValue, dispatch }) => {
    try {
      await uploadEvidenceApi(requestId, formData);
      toast.success("Evidence uploaded successfully!");
      dispatch(fetchWorkDetail(requestId));
    } catch (err) {
      toast.error("Evidence upload failed");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const markCompleted = createAsyncThunk(
  "worker/markCompleted",
  async (requestId, { rejectWithValue, dispatch }) => {
    try {
      await markCompletedApi(requestId);
      toast.success("Work marked as complete!");
      dispatch(fetchWorkDetail(requestId));
      dispatch(fetchWallet());
    } catch (err) {
      toast.error("Failed to mark complete");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const confirmCashPaid = createAsyncThunk(
  "worker/confirmCashPaid",
  async (requestId, { rejectWithValue, dispatch }) => {
    try {
      await confirmCashPaidApi(requestId);
      toast.success("Cash payment confirmed");
      dispatch(fetchWorkDetail(requestId));
    } catch (err) {
      toast.error("Failed to confirm payment");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const confirmCashReceived = createAsyncThunk(
  "worker/confirmCashReceived",
  async (requestId, { rejectWithValue, dispatch }) => {
    try {
      await confirmCashReceivedApi(requestId);
      toast.success("Cash received confirmed");
      dispatch(fetchWorkDetail(requestId));
      dispatch(fetchWallet());
    } catch (err) {
      toast.error("Failed to confirm receipt");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createWithdrawal = createAsyncThunk(
  "worker/createWithdrawal",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await createWithdrawalApi(data);
      toast.success("Withdrawal request submitted!");
      dispatch(fetchWallet());
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  "worker/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getNotificationsApi();
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "worker/markNotificationRead",
  async (id, { rejectWithValue }) => {
    try {
      await markNotificationReadApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "worker/updateProfile",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await updateProfileApi(data);
      const updatedUser = res.data.data || res.data;
      toast.success("Profile updated!");
      // Sync updated user fields (language, name, etc.) into auth state immediately
      const currentToken = localStorage.getItem("token");
      dispatch(loginSuccess({ token: currentToken, user: updatedUser }));
      return updatedUser;
    } catch (err) {
      toast.error("Profile update failed");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createDispute = createAsyncThunk(
  "worker/createDispute",
  async ({ requestId, reason }, { rejectWithValue }) => {
    try {
      await createDisputeApi(requestId, reason);
      toast.success("Dispute filed successfully");
    } catch (err) {
      toast.error("Failed to file dispute");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const submitReview = createAsyncThunk(
  "worker/submitReview",
  async ({ requestId, data }, { rejectWithValue }) => {
    try {
      await submitCustomerReviewApi(requestId, data);
      toast.success("Review submitted!");
    } catch (err) {
      toast.error("Review submission failed");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ====================================================
// SLICE
// ====================================================

const initialState = {
  profile: null,
  isOnline: false,

  // Wallet
  wallet: null,
  transactions: [],
  withdrawals: [],

  // Assignments
  assignments: [],
  currentWork: null,
  activeWork: null,

  // Notifications
  notifications: [],

  // Real-time incoming assignment popup
  incomingAssignment: null,

  // Loading states
  loading: false,
  walletLoading: false,
  assignmentsLoading: false,
  workLoading: false,
  actionLoading: false,

  error: null,
};

const workerSlice = createSlice({
  name: "worker",
  initialState,
  reducers: {
    setIncomingAssignment: (state, action) => {
      state.incomingAssignment = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLocation: (state, action) => {
      if (state.profile) {
        state.profile.current_latitude = action.payload.lat;
        state.profile.current_longitude = action.payload.lng;
      }
    },
    setActiveWork: (state, action) => {
      state.activeWork = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Dashboard Data
    builder
      .addCase(fetchDashboardData.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.assignments = action.payload.assignments;
        state.activeWork = action.payload.activeWork;
        state.isOnline = action.payload.profile?.availability_status === "available";
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Availability
    builder
      .addCase(updateAvailabilityStatus.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.availability_status = action.payload?.availability_status;
          state.isOnline = action.payload?.availability_status === "available";
        }
      });

    // Wallet
    builder
      .addCase(fetchWallet.pending, (state) => { state.walletLoading = true; })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.walletLoading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchWallet.rejected, (state) => { state.walletLoading = false; });

    builder
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      });

    builder
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.withdrawals = action.payload;
      });

    builder
      .addCase(createWithdrawal.fulfilled, (state, action) => {
        if (action.payload) state.withdrawals.unshift(action.payload);
      });

    // Assignments
    builder
      .addCase(fetchAssignments.pending, (state) => { state.assignmentsLoading = true; })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.assignmentsLoading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state) => { state.assignmentsLoading = false; });

    // Work Detail
    builder
      .addCase(fetchWorkDetail.pending, (state) => { state.workLoading = true; })
      .addCase(fetchWorkDetail.fulfilled, (state, action) => {
        state.workLoading = false;
        state.currentWork = action.payload;
      })
      .addCase(fetchWorkDetail.rejected, (state) => { state.workLoading = false; });

    // Action loading states
    const actionThunks = [
      markOnTheWay, confirmWorkStart, uploadEvidence, markCompleted,
      confirmCashPaid, confirmCashReceived, acceptAssignment, rejectAssignment,
      updateProfile,
    ];
    actionThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => { state.actionLoading = true; })
        .addCase(thunk.fulfilled, (state) => { state.actionLoading = false; })
        .addCase(thunk.rejected, (state) => { state.actionLoading = false; });
    });

    // Notifications
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.notifications.find((n) => n.notification_id === action.payload);
        if (n) n.is_read = true;
      });
  },
});

export const {
  setIncomingAssignment,
  clearError,
  updateLocation,
  setActiveWork,
} = workerSlice.actions;

export default workerSlice.reducer;
