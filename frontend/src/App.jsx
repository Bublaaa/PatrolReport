import { Toaster } from "react-hot-toast";
import { useAuthStore } from "../src/stores/auth.store.js";
import { useEffect, lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";

import LoginPage from "./pages/login.page.jsx";

const AdminDashboard = lazy(() => import("./pages/admin.dashboard.page.jsx"));

const UserPage = lazy(() =>
  import("./pages/admin.pages/user.dashboard.page.jsx")
);
const AddUserPage = lazy(() => import("./pages/admin.pages/add.user.page.jsx"));
const UserDetailPage = lazy(() =>
  import("./pages/admin.pages/update.user.page.jsx")
);

const PatrolPointPage = lazy(() =>
  import("./pages/admin.pages/patrol.point.dashboard.page.jsx")
);
const AddPatrolPointPage = lazy(() =>
  import("./pages/admin.pages/add.patrol.point.page.jsx")
);
const PatrolPointDetailPage = lazy(() =>
  import("./pages/admin.pages/update.patrol.point.page.jsx")
);

const ReportPage = lazy(() =>
  import("./pages/admin.pages/report.dashboard.page.jsx")
);
const ReportDetailPage = lazy(() =>
  import("./pages/admin.pages/report.detail.page.jsx")
);
const CreateReportPage = lazy(() => import("./pages/create.report.page.jsx"));
const ScanPage = lazy(() => import("./pages/scan.page.jsx"));

const ProtectedRoute = ({ children, requiredPosition }) => {
  const { isAuthenticated, userDetail } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPosition && userDetail.position !== requiredPosition) {
    if (
      userDetail.position === "admin" &&
      location.pathname !== "/admin" &&
      !location.pathname.startsWith("/admin/")
    ) {
      return <Navigate to="/admin" replace />;
    }
  }
  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-6h-6 animate-spin mx-auto" />
      </div>
    );
  }
  return (
    <div className="h-screen w-full bg-white-shadow flex items-center justify-center overflow-hidden">
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/scan"
          element={
            <Suspense
              fallback={<Loader className="w-6h-6 animate-spin mx-auto" />}
            >
              <ScanPage />
            </Suspense>
          }
        />
        <Route
          path="report/create/:id"
          element={
            <Suspense
              fallback={<Loader className="w-6h-6 animate-spin mx-auto" />}
            >
              <CreateReportPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredPosition="admin">
              <Suspense
                fallback={<Loader className="w-6h-6 animate-spin mx-auto" />}
              >
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="user" replace />} />

          <Route
            path="user"
            element={
              <Suspense
                fallback={<Loader className="w-6h-6 animate-spin mx-auto" />}
              >
                <UserPage />
              </Suspense>
            }
          />
          <Route
            path="user/add"
            element={
              <Suspense>
                <AddUserPage />
              </Suspense>
            }
          />

          <Route
            path="user/:id"
            element={
              <Suspense>
                <UserDetailPage />
              </Suspense>
            }
          />

          <Route
            path="patrol-point"
            element={
              <Suspense
                fallback={<Loader className="w-6h-6 animate-spin mx-auto" />}
              >
                <PatrolPointPage />
              </Suspense>
            }
          />
          <Route
            path="patrol-point/add"
            element={
              <Suspense>
                <AddPatrolPointPage />
              </Suspense>
            }
          />
          <Route
            path="patrol-point/:id"
            element={
              <Suspense>
                <PatrolPointDetailPage />
              </Suspense>
            }
          />

          <Route
            path="report"
            element={
              <Suspense
                fallback={<Loader className="w-6h-6 animate-spin mx-auto" />}
              >
                <ReportPage />
              </Suspense>
            }
          />
          <Route
            path="report/:id"
            element={
              <Suspense>
                <ReportDetailPage />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
