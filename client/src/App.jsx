import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { useAuth } from "./context/useAuth";
import "./App.css";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const InvestmentPage = lazy(() => import("./pages/InvestmentPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DashboardLayout = lazy(() => import("./pages/DashboardLayout"));
const WelcomePage = lazy(() => import("./pages/WelcomePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const VerifyEmailPage = lazy(() =>
  import("./features/auth/pages/VerifyEmailPage")
);

function PageLoader({ label = "Memuat halaman..." }) {
  return (
    <div className="app-route-loader-shell">
      <main className="app-route-loader-main">
        <div className="app-route-loader" role="status" aria-live="polite">
          <div className="sawit-loader-core sawit-loader-core-lg" aria-hidden="true" />
          <img src="/logo-no-bg.png" alt="" className="app-route-loader-logo" />
          <p className="app-route-loader-label">{label}</p>
        </div>
      </main>
    </div>
  );
}

function RequireAuth() {
  const { isAuthenticated, isChecking } = useAuth();

  if (isChecking) {
    return <PageLoader label="Memeriksa sesi..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

function AuthGate() {
  const { isAuthenticated, isChecking } = useAuth();

  if (isChecking) {
    return <PageLoader label="Memeriksa sesi..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>        
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth" element={<AuthGate />} />

          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="subscriptions" element={<SubscriptionPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="investments" element={<InvestmentPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
