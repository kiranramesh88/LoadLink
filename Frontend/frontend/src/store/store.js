import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slice/authSlice';
import workerReducer from '../features/worker/slice/workerSlice';
import customerReducer from '../features/customer/slice/customerSlice';
import unionReducer from '../features/union/slice/unionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    worker: workerReducer,
    customer: customerReducer,
    union: unionReducer,
  },
});
