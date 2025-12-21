import { Toaster } from "react-hot-toast";
import { useAuthStore } from "../src/stores/auth.store.js";
import { useEffect, lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";

import LoginPage from "./pages/login.page.jsx";

const ProtectedRoute = ({ children, requiredPosition }) => {
  const { isAuthenticated, userDetail } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPosition && userDetail.position !== requiredPosition) {
    if (userDetail.position === "Admin" && location.pathname !== "/admin") {
      return <Navigate to="/admin" replace />;
    }
  }
  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, userDetail } = useAuthStore();

  if (isAuthenticated && userDetail.position === "Admin") {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/login" replace />;
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
          path="/admin"
          element={
            <ProtectedRoute requiredPosition="Admin">
              <Suspense
                fallback={<Loader className="w-6h-6 animate-spin mx-auto" />}
              >
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        >
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
            path="report"
            element={
              <Suspense
                fallback={<Loader className="w-6h-6 animate-spin mx-auto" />}
              >
                <ReportPage />
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
