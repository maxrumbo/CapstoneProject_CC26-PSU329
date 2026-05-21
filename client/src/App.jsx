import { Suspense, lazy, useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import { menuItems } from "./data/dashboardConfig";
import { useAuth } from "./context/useAuth";
import "./App.css";

const pageLoaders = {
  dashboard: () => import("./pages/DashboardPage"),
  transactions: () => import("./pages/TransactionsPage"),
  wishlist: () => import("./pages/WishlistPage"),
  investment: () => import("./pages/InvestmentPage"),
  profile: () => import("./pages/ProfilePage"),
  login: () => import("./features/auth/pages/LoginPage"),
  register: () => import("./features/auth/pages/RegisterPage"),
};

const DashboardPage = lazy(pageLoaders.dashboard);
const TransactionsPage = lazy(pageLoaders.transactions);
const WishlistPage = lazy(pageLoaders.wishlist);
const InvestmentPage = lazy(pageLoaders.investment);
const ProfilePage = lazy(pageLoaders.profile);
const LoginPage = lazy(pageLoaders.login);
const RegisterPage = lazy(pageLoaders.register);

const PAGE_HASHES = {
  dashboard: "dashboard",
  transactions: "transactions",
  wishlist: "wishlist-calculator",
  investment: "investment",
  profile: "profile",
  login: "login",
  register: "register",
};

const AUTH_PAGES = new Set(["login", "register"]);

const HASH_TO_PAGE = {
  dashboard: "dashboard",
  transaksi: "transactions",
  transactions: "transactions",
  "wishlist-calculator": "wishlist",
  wishlist: "wishlist",
  investasi: "investment",
  investment: "investment",
  profile: "profile",
  profil: "profile",
  login: "login",
  register: "register",
};

const getPageFromHash = (value = window.location.hash) => {
  const hash = value.replace("#", "");
  return HASH_TO_PAGE[hash] ?? "login";
};

const getAllowedPage = (page, isAuthenticated) => {
  if (!isAuthenticated && !AUTH_PAGES.has(page)) {
    return "login";
  }

  if (isAuthenticated && AUTH_PAGES.has(page)) {
    return "dashboard";
  }

  return page;
};

const updateHash = (page) => {
  const nextHash = PAGE_HASHES[page];

  if (nextHash && window.location.hash !== `#${nextHash}`) {
    window.location.hash = nextHash;
  }
};

const preloadPage = (page) => {
  pageLoaders[page]?.();
};

const SIDEBAR_DEFAULT_WIDTH = 256;
const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 336;

const clampSidebarWidth = (width) =>
  Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));

function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  const { user, isAuthenticated, isChecking, setSession, clearSession } = useAuth();
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    const nextPage = getAllowedPage(getPageFromHash(hash), isAuthenticated);
    updateHash(nextPage);
  }, [hash, isAuthenticated]);

  const navigateToPage = (page) => {
    const nextPage = getAllowedPage(page, isAuthenticated);

    preloadPage(nextPage);
    updateHash(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSuccess = (token, nextUser, rememberMe = true) => {
    setSession(token, nextUser, rememberMe);
    preloadPage("dashboard");
    updateHash("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    clearSession();
    preloadPage("login");
    updateHash("login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenProfile = () => {
    navigateToPage("profile");
  };

  const resizeSidebarBy = (delta) => {
    setSidebarWidth((prevWidth) => clampSidebarWidth(prevWidth + delta));
  };

  const handleSidebarResizeStart = (event) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = sidebarWidth;

    const handlePointerMove = (moveEvent) => {
      const nextWidth = startWidth + moveEvent.clientX - startX;
      setSidebarWidth(clampSidebarWidth(nextWidth));
    };

    const handlePointerEnd = () => {
      document.body.classList.remove("is-resizing-sidebar");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };

    document.body.classList.add("is-resizing-sidebar");
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
  };

  const currentPage = getAllowedPage(getPageFromHash(hash), isAuthenticated);

  const renderAuthPage = () => {
    if (currentPage === "register") {
      return <RegisterPage onNavigate={navigateToPage} />;
    }

    return (
      <LoginPage onAuthSuccess={handleAuthSuccess} onNavigate={navigateToPage} />
    );
  };

  const userName = user?.display_name || user?.email || "";

  const renderPage = () => {
    if (currentPage === "transactions") {
      return (
        <TransactionsPage
          onProfileClick={handleOpenProfile}
          userName={userName}
        />
      );
    }

    if (currentPage === "wishlist") {
      return (
        <WishlistPage
          onProfileClick={handleOpenProfile}
          userName={userName}
        />
      );
    }

    if (currentPage === "investment") {
      return (
        <InvestmentPage
          onProfileClick={handleOpenProfile}
          userName={userName}
        />
      );
    }

    if (currentPage === "profile") {
      return (
        <ProfilePage
          onLogout={handleLogout}
          onProfileClick={handleOpenProfile}
          user={user}
          userName={userName}
        />
      );
    }

    return (
      <DashboardPage
        onProfileClick={handleOpenProfile}
        userName={userName}
      />
    );
  };

  if (isChecking) {
    return (
      <div className="auth-shell">
        <main className="auth-main">
          <div className="page-loading" role="status">
            Memeriksa sesi...
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-shell">
        <main className="auth-main">
          <Suspense
            fallback={
              <div className="page-loading" role="status">
                Memuat halaman...
              </div>
            }
          >
            {renderAuthPage()}
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <div
      className="app-shell"
      style={{ "--sidebar-width": `${sidebarWidth}px` }}
    >
      <Sidebar
        menuItems={menuItems}
        currentPage={currentPage}
        onCreateTransaction={() => navigateToPage("transactions")}
        onNavigate={navigateToPage}
        onPreload={preloadPage}
        onResizeByKeyboard={resizeSidebarBy}
        onResizeStart={handleSidebarResizeStart}
      />

      <main className="dashboard">
        <Suspense
          fallback={
            <div className="page-loading" role="status">
              Memuat halaman...
            </div>
          }
        >
          {renderPage()}
        </Suspense>
      </main>
    </div>
  );
}

export default App;
