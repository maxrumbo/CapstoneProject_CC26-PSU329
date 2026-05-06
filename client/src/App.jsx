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
};

const DashboardPage = lazy(pageLoaders.dashboard);
const TransactionsPage = lazy(pageLoaders.transactions);
const WishlistPage = lazy(pageLoaders.wishlist);

const PAGE_HASHES = {
  dashboard: "dashboard",
  transactions: "transactions",
  wishlist: "wishlist-calculator",
};

const HASH_TO_PAGE = {
  dashboard: "dashboard",
  transaksi: "transactions",
  transactions: "transactions",
  "wishlist-calculator": "wishlist",
  wishlist: "wishlist",
};

const getPageFromHash = () => {
  const hash = window.location.hash.replace("#", "");
  return HASH_TO_PAGE[hash] ?? "dashboard";
};

function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  const [transactions, setTransactions] = useState(initialTransactions);
  const summary = useMemo(
    () => summarizeTransactions(transactions),
    [transactions]
  );

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

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
    pageLoaders[page]?.();
    setCurrentPage(page);
    const nextHash = PAGE_HASHES[page];

    if (nextHash && window.location.hash !== `#${nextHash}`) {
      window.location.hash = nextHash;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="app-shell">
      <Sidebar
        menuItems={menuItems}
        currentPage={currentPage}
        onCreateTransaction={() => navigateToPage("transactions")}
        onNavigate={navigateToPage}
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
