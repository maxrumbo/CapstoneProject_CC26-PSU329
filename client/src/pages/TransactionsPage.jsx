import DashboardHeader from "../components/dashboard/DashboardHeader";
import SummaryReport from "../components/dashboard/SummaryReport";
import TransactionForm from "../features/transactions/components/TransactionForm";
import TransactionHistory from "../features/transactions/components/TransactionHistory";

function TransactionsPage({ summary, transactions, onAddTransaction }) {
  return (
    <>
      <DashboardHeader
        eyebrow="Fitur Aktif"
        title="Transaksi"
        description="Catat pemasukan dan pengeluaran, lalu pantau riwayat terbaru."
        icon="receipt"
      />
      <SummaryReport summary={summary} />

      <section className="workspace-grid single-column">
        <div className="primary-column">
          <TransactionForm
            availableBalance={summary.balance}
            onAddTransaction={onAddTransaction}
          />
          <TransactionHistory transactions={transactions} />
        </div>
      </section>
    </>
  );
}

export default TransactionsPage;
