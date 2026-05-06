import { formatCurrency } from "../../utils/formatCurrency";

function SummaryReport({ summary }) {
  return (
    <section className="report-card" aria-label="Ringkasan transaksi">
      <div className="report-equation">
        <article>
          <span>Pemasukan</span>
          <strong>{formatCurrency(summary.income)}</strong>
        </article>

        <b>-</b>

        <article>
          <span>Pengeluaran</span>
          <strong>{formatCurrency(summary.expense)}</strong>
        </article>

        <b>=</b>

        <article>
          <span>Saldo Aktif</span>
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
