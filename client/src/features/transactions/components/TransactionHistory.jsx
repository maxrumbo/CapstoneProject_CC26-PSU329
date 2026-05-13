import Icon from "../../../components/ui/Icon";
import { formatCurrency } from "../../../utils/formatCurrency";

function TransactionHistory({
  filters,
  onFilterChange,
  onResetFilters,
  transactions,
}) {
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    onFilterChange(name, value);
  };

  return (
    <section className="panel transaction-table-card">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">
            <Icon name="receipt" size={18} />
          </span>
          <div>
            <p className="eyebrow">Transaksi Aktif</p>
            <h3>Riwayat Terbaru</h3>
          </div>
        </div>
        <span className="status-pill">Berfungsi</span>
      </div>

      <div className="report-toolbar">
        <label>
          <span className="field-label">
            <Icon name="calendar" size={14} />
            Periode
          </span>
          <select
            name="period"
            value={filters.period}
            onChange={handleFilterChange}
          >
            <option value="all">Semua</option>
            <option value="this-month">Bulan ini</option>
            <option value="last-month">Bulan lalu</option>
            <option value="this-year">Tahun ini</option>
            <option value="custom">Kustom</option>
          </select>
        </label>

        <label>
          <span className="field-label">
            <Icon name="receipt" size={14} />
            Tipe
          </span>
          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">Semua tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </label>

        <label>
          <span className="field-label">
            <Icon name="calendar" size={14} />
            Dari
          </span>
          <input
            type="date"
            name="start_date"
            max={filters.end_date || undefined}
            value={filters.start_date}
            onChange={handleFilterChange}
          />
        </label>

        <label>
          <span className="field-label">
            <Icon name="calendar" size={14} />
            Sampai
          </span>
          <input
            type="date"
            name="end_date"
            min={filters.start_date || undefined}
            value={filters.end_date}
            onChange={handleFilterChange}
          />
        </label>

        <button type="button" onClick={onResetFilters}>
          <span className="button-content">
            <Icon name="repeat" size={15} />
            Reset
          </span>
        </button>
      </div>

      <div className="transaction-table">
        {transactions.length ? (
          transactions.map((transaction) => (
            <article className="transaction-row" key={transaction.id}>
              <div className="transaction-row-main">
                <span
                  className={
                    transaction.type === "income"
                      ? "transaction-type-icon income"
                      : "transaction-type-icon expense"
                  }
                >
                  <Icon
                    name={transaction.type === "income" ? "income" : "expense"}
                    size={16}
                  />
                </span>
                <div>
                  <strong>{transaction.description}</strong>
                  <span className="transaction-meta">
                    {[transaction.category, transaction.method, transaction.date]
                      .filter(Boolean)
                      .join(" / ")}
                  </span>
                </div>
              </div>

              <strong
                className={
                  transaction.type === "income"
                    ? "amount income"
                    : "amount expense"
                }
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </strong>
            </article>
          ))
        ) : (
          <div className="empty-state">
            Belum ada transaksi pada filter ini.
          </div>
        )}
      </div>
    </section>
  );
}

export default TransactionHistory;
