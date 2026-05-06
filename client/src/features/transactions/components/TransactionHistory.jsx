import Icon from "../../../components/ui/Icon";
import { formatCurrency } from "../../../utils/formatCurrency";

function TransactionHistory({ transactions }) {
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
          <select defaultValue="2026" disabled>
            <option value="2026">2026</option>
          </select>
        </label>

        <label>
          <span className="field-label">
            <Icon name="calendar" size={14} />
            Dari
          </span>
          <input type="date" value="2026-04-01" readOnly />
        </label>

        <label>
          <span className="field-label">
            <Icon name="calendar" size={14} />
            Sampai
          </span>
          <input type="date" value="2026-04-30" readOnly />
        </label>

        <button type="button" disabled>
          <span className="button-content">
            <Icon name="chart" size={15} />
            Update Report
          </span>
        </button>
      </div>

      <div className="transaction-table">
        {transactions.map((transaction) => (
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
        ))}
      </div>
    </section>
  );
}

export default TransactionHistory;
