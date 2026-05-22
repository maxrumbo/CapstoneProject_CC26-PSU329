import { useMemo, useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SummaryReport from "../components/dashboard/SummaryReport";
import TransactionForm from "../features/transactions/components/TransactionForm";
import TransactionHistory from "../features/transactions/components/TransactionHistory";
import { useTransactions } from "../features/transactions/hooks/useTransactions";

const defaultFilters = {
  period: "all",
  type: "",
  start_date: "",
  end_date: "",
};

const padDatePart = (value) => String(value).padStart(2, "0");

const toDateInputValue = (date) =>
  [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");

const getPeriodDates = (period) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  if (period === "this-month") {
    return {
      start_date: toDateInputValue(new Date(year, month, 1)),
      end_date: toDateInputValue(new Date(year, month + 1, 0)),
    };
  }

  if (period === "last-month") {
    return {
      start_date: toDateInputValue(new Date(year, month - 1, 1)),
      end_date: toDateInputValue(new Date(year, month, 0)),
    };
  }

  if (period === "this-year") {
    return {
      start_date: toDateInputValue(new Date(year, 0, 1)),
      end_date: toDateInputValue(new Date(year, 11, 31)),
    };
  }

  return {
    start_date: "",
    end_date: "",
  };
};

const buildApiFilters = (filters) => {
  const apiFilters = {};

  if (filters.type) {
    apiFilters.type = filters.type;
  }
  if (filters.start_date) {
    apiFilters.start_date = filters.start_date;
  }
  if (filters.end_date) {
    apiFilters.end_date = filters.end_date;
  }

  return apiFilters;
};

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

function TransactionsPage({ onProfileClick, userName }) {
  const [filters, setFilters] = useState(defaultFilters);
  const apiFilters = useMemo(() => buildApiFilters(filters), [filters]);
  const {
    transactions,
    summary,
    balanceSummary,
    isLoading,
    isMutating,
    error,
    addTransaction,
    predictCategory,
  } = useTransactions(apiFilters);

  const availableBalance = toNumber(balanceSummary?.balance ?? summary.balance);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      if (name === "period") {
        const periodDates = value === "custom" ? {} : getPeriodDates(value);
        return {
          ...prev,
          ...periodDates,
          period: value,
        };
      }

      return {
        ...prev,
        [name]: value,
        period:
          name === "start_date" || name === "end_date" ? "custom" : prev.period,
      };
    });
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <>
      <DashboardHeader
        eyebrow="Fitur Aktif"
        title="Transaksi"
        description="Catat pemasukan dan pengeluaran, lalu pantau riwayat terbaru."
        icon="receipt"
        onProfileClick={onProfileClick}
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
            availableBalance={availableBalance}
            onAddTransaction={addTransaction}
            onPredictCategory={predictCategory}
          />
          {isLoading && !transactions.length ? (
            <div className="page-loading" role="status">
              Memuat transaksi...
            </div>
          ) : (
            <TransactionHistory
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              transactions={transactions}
            />
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
