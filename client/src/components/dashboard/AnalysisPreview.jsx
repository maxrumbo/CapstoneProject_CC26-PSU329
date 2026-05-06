import Icon from "../ui/Icon";

function AnalysisPreview({ bars }) {
  return (
    <section className="panel chart-card">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">
            <Icon name="chart" size={18} />
          </span>
          <div>
            <p className="eyebrow">Preview Analisis</p>
            <h3>Income & Expense</h3>
          </div>
        </div>
      </div>

      <div className="bar-chart" aria-hidden="true">
        {bars.map((bar) => (
          <div
            key={bar.month}
            style={{ "--income": bar.income, "--expense": bar.expense }}
          >
            <span></span>
            <span></span>
            <small>{bar.month}</small>
          </div>
        ))}
      </div>

      <p className="muted-note">
        Grafik ini masih preview. Data aktif saat ini hanya dari form transaksi.
      </p>
    </section>
  );
}

export default AnalysisPreview;
