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

function PageLoader({ label = "Hampir siap..." }) {
  return (
    <div className="app-route-loader-shell">
      <main className="app-route-loader-main">
        <div className="app-route-loader" role="status" aria-live="polite">
          <svg
            className="app-route-loader-hourglass"
            viewBox="0 0 64 64"
            width="96"
            height="96"
            aria-hidden="true"
            role="img"
          >
            <defs>
              <linearGradient id="gSand" x1="0" x2="1">
                <stop offset="0%" stopColor="#9effc9" />
                <stop offset="100%" stopColor="#39D98A" />
              </linearGradient>
            </defs>

            {/* frame */}
            <g className="hg-frame" fill="none" stroke="#22312d" strokeWidth="2">
              <path d="M16 6h32v6L34 30l14 18v6H16v-6l14-18L16 12V6z" strokeOpacity="0.36" />
            </g>

            {/* top sand (shrinks) */}
            <g className="hg-top-sand" fill="url(#gSand)">
              <path d="M22 12h20c0 8-8 14-10 16-2-2-10-8-10-16z" />
            </g>

            {/* bottom sand (grows) */}
            <g className="hg-bottom-sand" fill="url(#gSand)">
              <path d="M22 52h20c0-8-8-14-10-16-2 2-10 8-10 16z" />
            </g>

            {/* falling grains */}
            <g className="hg-grains" fill="#9effc9">
              <circle className="grain g1" cx="31.5" cy="28" r="0.95" />
              <circle className="grain g2" cx="32" cy="32" r="0.8" />
              <circle className="grain g3" cx="32.5" cy="36" r="0.7" />
            </g>
          </svg>
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
