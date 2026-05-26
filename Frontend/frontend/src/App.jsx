import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

// Auth
import LoginPage from "./features/auth/pages/LoginPage";
import WorkerRegistrationPage from "./features/auth/pages/WorkerRegistrationPage";
import LandingPage from "./features/auth/pages/LandingPage";

// Guard
import ProtectedRoute from "./components/ProtectedRoute";

// Worker Layout & Pages
import WorkerLayout from "./layouts/WorkerLayout";
import WorkerDashboard from "./features/worker/pages/WorkerDashboard";
import AssignmentsPage from "./features/worker/pages/AssignmentsPage";
import ActiveWorkPage from "./features/worker/pages/ActiveWorkPage";
import WorkEvidencePage from "./features/worker/pages/WorkEvidencePage";
import LiveTrackingPage from "./features/worker/pages/LiveTrackingPage";
import WorkerWalletPage from "./features/worker/pages/WorkerWalletPage";
import WithdrawalPage from "./features/worker/pages/WithdrawalPage";
import SettlementPage from "./features/worker/pages/SettlementPage";
import WorkHistoryPage from "./features/worker/pages/WorkHistoryPage";
import NotificationsPage from "./features/worker/pages/NotificationsPage";
import ReviewCustomerPage from "./features/worker/pages/ReviewCustomerPage";
import WorkerProfilePage from "./features/worker/pages/WorkerProfilePage";
import DisputePage from "./features/worker/pages/DisputePage";
import SettingsPage from "./features/worker/pages/SettingsPage";

// Union Admin Pages
import UnionLayout from "./features/union/layouts/UnionLayout";
import UnionDashboard from "./features/union/pages/UnionDashboard";
import ProjectTracking from "./features/union/pages/ProjectTracking";
import UnionRequestsPage from "./features/union/pages/UnionRequestsPage";
import RequestDetailPage from "./features/union/pages/RequestDetailPage";
import ActiveWorksPage from "./features/union/pages/ActiveWorksPage";
import DisputeListPage from "./features/union/pages/DisputeListPage";
import DisputeDetailPage from "./features/union/pages/DisputeDetailPage";
import SmartTeamRecommendation from "./features/union/pages/management/SmartTeamRecommendation";
import WorkerReplacementFlow from "./features/union/pages/management/WorkerReplacementFlow";

// Customer Pages
import CustomerDashboard from "./features/customer/pages/CustomerDashboard";
import CustomerProfilePage from "./features/customer/pages/CustomerProfilePage";
import CustomerHistoryPage from "./features/customer/pages/CustomerHistoryPage";
import BookingLayout from "./features/customer/layouts/BookingLayout";
import CategorySelection from "./features/customer/pages/booking/CategorySelection";
import DynamicQuestionnaire from "./features/customer/pages/booking/DynamicQuestionnaire";
import LocationQuotation from "./features/customer/pages/booking/LocationQuotation";
import LiveWorkTracker from "./features/customer/pages/LiveWorkTracker";
import CompletionPayment from "./features/customer/pages/CompletionPayment";
import ViewQuotesPage from "./features/customer/pages/ViewQuotesPage";
import ReviewWorkersPage from "./features/customer/pages/ReviewWorkersPage";
import CustomerDisputePage from "./features/customer/pages/CustomerDisputePage";

// RootRedirect: sends logged-in users to their correct dashboard
const RootRedirect = () => {
  const { token, user } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === "CUSTOMER") return <Navigate to="/customer/dashboard" replace />;
  if (user?.role === "UNION_ADMIN") return <Navigate to="/union/dashboard" replace />;
  return <Navigate to="/worker" replace />;
};

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          {/* Root: cinematic brand reveal landing page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/worker/register" element={<WorkerRegistrationPage />} />

          {/* ── Worker Routes (WORKER role only) ── */}
          <Route
            path="/worker"
            element={
              <ProtectedRoute allowedRoles={["WORKER"]}>
                <WorkerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<WorkerDashboard />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="work/:id" element={<ActiveWorkPage />} />
            <Route path="work/:id/evidence" element={<WorkEvidencePage />} />
            <Route path="tracking" element={<LiveTrackingPage />} />
            <Route path="wallet" element={<WorkerWalletPage />} />
            <Route path="withdraw" element={<WithdrawalPage />} />
            <Route path="settlements" element={<SettlementPage />} />
            <Route path="history" element={<WorkHistoryPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="review/:id" element={<ReviewCustomerPage />} />
            <Route path="profile" element={<WorkerProfilePage />} />
            <Route path="dispute/:id" element={<DisputePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* ── Customer Routes (CUSTOMER role only) ── */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/history"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/booking"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <BookingLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="category" replace />} />
            <Route path="category" element={<CategorySelection />} />
            <Route path="details" element={<DynamicQuestionnaire />} />
            <Route path="location" element={<LocationQuotation />} />
          </Route>
          <Route
            path="/customer/track/:id"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <LiveWorkTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/payment/:id"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CompletionPayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/quotes"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <ViewQuotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/review/:id"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <ReviewWorkersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/dispute/:id"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerDisputePage />
              </ProtectedRoute>
            }
          />

          {/* ── Union Admin Routes (UNION_ADMIN role only) ── */}
          <Route
            path="/union"
            element={
              <ProtectedRoute allowedRoles={["UNION_ADMIN"]}>
                <UnionLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<UnionDashboard />} />
            <Route path="requests"      element={<UnionRequestsPage />} />
            <Route path="requests/:id" element={<RequestDetailPage />} />
            <Route path="requests/:id/team-recommendation" element={<SmartTeamRecommendation />} />
            <Route path="requests/:id/replace-worker"      element={<WorkerReplacementFlow />} />
            <Route path="active-works"  element={<ActiveWorksPage />} />
            <Route path="disputes"      element={<DisputeListPage />} />
            <Route path="disputes/:id" element={<DisputeDetailPage />} />
            <Route path="tracking"      element={<ProjectTracking />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;