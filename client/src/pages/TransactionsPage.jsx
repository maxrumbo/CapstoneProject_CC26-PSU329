import DashboardHeader from "../components/dashboard/DashboardHeader";
import SummaryReport from "../components/dashboard/SummaryReport";
import TransactionForm from "../features/transactions/components/TransactionForm";
import TransactionHistory from "../features/transactions/components/TransactionHistory";
import { useTransactions } from "../features/transactions/hooks/useTransactions";

function TransactionsPage({ userName }) {
  const {
    transactions,
    summary,
    isLoading,
    isMutating,
    error,
    addTransaction,
  } = useTransactions();

  return (
    <>
      <DashboardHeader
        eyebrow="Fitur Aktif"
        title="Transaksi"
        description="Catat pemasukan dan pengeluaran, lalu pantau riwayat terbaru."
        icon="receipt"
        userName={userName}
      />
      <SummaryReport summary={summary} />

      {error && (
        <p className="form-message" role="alert">
          {error}
        </p>
      )}

      <section className="workspace-grid single-column">
        <div className="primary-column">
          <TransactionForm
            availableBalance={summary.balance}
            onAddTransaction={addTransaction}
          />
          {isLoading && !transactions.length ? (
            <div className="page-loading" role="status">
              Memuat transaksi...
            </div>
          ) : (
            <TransactionHistory transactions={transactions} />
          )}
          {isMutating && (
            <p className="muted-note" role="status">
              Menyimpan perubahan...
            </p>
          )}
        </div>
      </section>
    </>
  );
}

export default TransactionsPage;
