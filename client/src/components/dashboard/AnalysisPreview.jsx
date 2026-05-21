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
        {hasStreamlit ? (
          <a
            className="streamlit-button"
            href={streamlitUrl}
            target="_blank"
            rel="noreferrer"
          >
            Buka penuh
          </a>
        ) : null}
      </div>

      {hasStreamlit ? (
        <div className="streamlit-frame-wrap">
          <iframe
            className="streamlit-frame"
            src={streamlitUrl}
            title="Dashboard analitik Streamlit"
            loading="lazy"
            sandbox="allow-downloads allow-forms allow-popups allow-same-origin allow-scripts"
          />
        </div>
      ) : (
        <div className="analysis-placeholder">
          <div>
            <span className="analysis-badge">Konfigurasi</span>
            <p>URL Streamlit belum tersedia.</p>
            <p className="analysis-helper">
              Isi VITE_STREAMLIT_URL agar dashboard analitik tampil di sini.
            </p>
          </div>
          <button
            className="streamlit-button is-disabled"
            type="button"
            disabled
            title="URL Streamlit belum tersedia"
          >
            Buka penuh
          </button>
        </div>
      )}
    </section>
  );
}

export default AnalysisPreview;
