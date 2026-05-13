import Icon from "../ui/Icon";

function AnalysisPreview({ streamlitUrl }) {
  const hasStreamlit = Boolean(streamlitUrl);

  return (
    <section className="panel chart-card">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">
            <Icon name="chart" size={18} />
          </span>
          <div>
            <p className="eyebrow">Dashboard Analitik</p>
            <h3>Streamlit Analytics</h3>
          </div>
        </div>
      </div>

      <div className="analysis-placeholder">
        <div>
          <span className="analysis-badge">Segera</span>
          <p>Dashboard analitik lengkap hanya tersedia dari Streamlit.</p>
          <p className="analysis-helper">Tombol aktif saat URL sudah disiapkan.</p>
        </div>
        {hasStreamlit ? (
          <a
            className="streamlit-button"
            href={streamlitUrl}
            target="_blank"
            rel="noreferrer"
          >
            Buka Streamlit
          </a>
        ) : (
          <button
            className="streamlit-button is-disabled"
            type="button"
            disabled
            title="URL Streamlit belum tersedia"
          >
            Buka Streamlit
          </button>
        )}
      </div>

      <p className="muted-note">
        Konten Streamlit akan muncul di sini setelah integrasi dari tim AI.
      </p>
    </section>
  );
}

export default AnalysisPreview;
