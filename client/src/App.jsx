import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import {
  featureCards,
  initialTransactions,
  menuItems,
  previewChartBars,
} from "./data/dashboardConfig";
import { formatCurrency } from "./utils/formatCurrency";
import { summarizeTransactions } from "./utils/summarizeTransactions";
import "./App.css";

const pageLoaders = {
  dashboard: () => import("./pages/DashboardPage"),
  transactions: () => import("./pages/TransactionsPage"),
  wishlist: () => import("./pages/WishlistPage"),
  login: () => import("./features/auth/pages/LoginPage"),
  register: () => import("./features/auth/pages/RegisterPage"),
};

const DashboardPage = lazy(pageLoaders.dashboard);
const TransactionsPage = lazy(pageLoaders.transactions);
const WishlistPage = lazy(pageLoaders.wishlist);
const LoginPage = lazy(pageLoaders.login);
const RegisterPage = lazy(pageLoaders.register);

const PAGE_HASHES = {
  dashboard: "dashboard",
  transactions: "transactions",
  wishlist: "wishlist-calculator",
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
  login: "login",
  register: "register",
};

const getPageFromHash = () => {
  const hash = window.location.hash.replace("#", "");
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
  const [currentPage, setCurrentPage] = useState(() =>
    getAllowedPage(getPageFromHash(), false)
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [transactions, setTransactions] = useState(initialTransactions);
  const summary = useMemo(
    () => summarizeTransactions(transactions),
    [transactions]
  );

  useEffect(() => {
    const handleHashChange = () => {
      const nextPage = getAllowedPage(getPageFromHash(), isAuthenticated);
      setCurrentPage(nextPage);
      updateHash(nextPage);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [isAuthenticated]);

  const addTransaction = (transaction) => {
    if (transaction.type === "expense" && transaction.amount > summary.balance) {
      return {
        success: false,
        message: `Saldo tidak cukup. Saldo tersedia saat ini ${formatCurrency(
          summary.balance
        )}.`,
      };
    }

    setTransactions((prev) => [
      {
        ...transaction,
        id: `TRX-${String(prev.length + 1).padStart(3, "0")}`,
      },
      ...prev,
    ]);

    return {
      success: true,
      message: "Transaksi berhasil ditambahkan ke riwayat.",
    };
  };

  const navigateToPage = (page) => {
    const nextPage = getAllowedPage(page, isAuthenticated);

    preloadPage(nextPage);
    setCurrentPage(nextPage);
    updateHash(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    preloadPage("dashboard");
    setCurrentPage("dashboard");
    updateHash("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const renderAuthPage = () => {
    if (currentPage === "register") {
      return (
        <RegisterPage
          onAuthSuccess={handleAuthSuccess}
          onNavigate={navigateToPage}
        />
      );
    }

    return (
      <LoginPage onAuthSuccess={handleAuthSuccess} onNavigate={navigateToPage} />
    );
  };

  const renderPage = () => {
    if (currentPage === "transactions") {
      return (
        <TransactionsPage
          summary={summary}
          transactions={transactions}
          onAddTransaction={addTransaction}
        />
      );
    }

    if (currentPage === "wishlist") {
      return <WishlistPage />;
    }

    return (
      <DashboardPage
        summary={summary}
        features={featureCards}
        bars={previewChartBars}
        onNavigate={navigateToPage}
      />
    );
  };

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
