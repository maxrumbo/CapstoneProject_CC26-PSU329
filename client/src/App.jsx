import { useMemo, useState } from "react";
import AnalysisPreview from "./components/dashboard/AnalysisPreview";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import FeaturePreview from "./components/dashboard/FeaturePreview";
import SummaryReport from "./components/dashboard/SummaryReport";
import Sidebar from "./components/layout/Sidebar";
import {
  featureCards,
  initialTransactions,
  menuItems,
  previewChartBars,
} from "./data/dashboardConfig";
import TransactionForm from "./features/transactions/components/TransactionForm";
import TransactionHistory from "./features/transactions/components/TransactionHistory";
import { formatCurrency } from "./utils/formatCurrency";
import { summarizeTransactions } from "./utils/summarizeTransactions";
import "./App.css";

function App() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const summary = useMemo(
    () => summarizeTransactions(transactions),
    [transactions]
  );

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

  const scrollToTransactionForm = () => {
    document.getElementById("transaksi")?.scrollIntoView();
  };

  return (
    <div className="app-shell">
      <Sidebar
        menuItems={menuItems}
        onCreateTransaction={scrollToTransactionForm}
      />

      <main className="dashboard">
        <DashboardHeader />
        <SummaryReport summary={summary} />

        <section className="workspace-grid">
          <div className="primary-column">
            <TransactionForm
              availableBalance={summary.balance}
              onAddTransaction={addTransaction}
            />
            <TransactionHistory transactions={transactions} />
          </div>

          <aside className="side-column">
            <FeaturePreview features={featureCards} />
            <AnalysisPreview bars={previewChartBars} />
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;
