import { formatCurrency } from "../../../utils/formatCurrency";

function TransactionHistory({ transactions }) {
  return (
    <section className="panel transaction-table-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Transaksi Aktif</p>
          <h3>Riwayat Terbaru</h3>
        </div>
        <span className="status-pill">Berfungsi</span>
      </div>

      <div className="report-toolbar">
        <label>
          Periode
          <select defaultValue="2026" disabled>
            <option value="2026">2026</option>
          </select>
        </label>

        <label>
          Dari
          <input type="date" value="2026-04-01" readOnly />
        </label>

        <label>
          Sampai
          <input type="date" value="2026-04-30" readOnly />
        </label>

        <button type="button" disabled>
          Update Report
        </button>
      </div>

      <div className="transaction-table">
        {transactions.map((transaction) => (
          <article className="transaction-row" key={transaction.id}>
            <div>
              <strong>{transaction.description}</strong>
              <span>
                {[transaction.category, transaction.method, transaction.date]
                  .filter(Boolean)
                  .join(" / ")}
              </span>
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
