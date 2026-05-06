import Icon from "../ui/Icon";
import { formatCurrency } from "../../utils/formatCurrency";

function SummaryReport({ summary }) {
  return (
    <section className="report-card" aria-label="Ringkasan transaksi">
      <div className="report-equation">
        <article className="report-metric income-metric">
          <span className="report-metric-icon">
            <Icon name="income" size={18} />
          </span>
          <span className="report-label">Pemasukan</span>
          <strong>{formatCurrency(summary.income)}</strong>
        </article>

        <b>-</b>

        <article className="report-metric expense-metric">
          <span className="report-metric-icon">
            <Icon name="expense" size={18} />
          </span>
          <span className="report-label">Pengeluaran</span>
          <strong>{formatCurrency(summary.expense)}</strong>
        </article>

        <b>=</b>

        <article className="report-metric balance-metric">
          <span className="report-metric-icon">
            <Icon name="balance" size={18} />
          </span>
          <span className="report-label">Saldo Aktif</span>
          <strong className="net-profit">
            {formatCurrency(summary.balance)}
          </strong>
        </article>
      </div>

      <p className="report-note">{summary.total} transaksi tercatat</p>
    </section>
  );
}

export default SummaryReport;
