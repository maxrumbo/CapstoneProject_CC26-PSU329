import Icon from "../ui/Icon";

function AnalysisPreview({
  streamlitUrl,
  fullUrl,
  eyebrow = "Dashboard Analitik",
  title = "Streamlit Analytics",
  icon = "chart",
  configName = "VITE_STREAMLIT_URL",
}) {
  const hasStreamlit = Boolean(streamlitUrl);

  return (
    <section className="panel chart-card">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">
            <Icon name={icon} size={18} />
          </span>
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h3>{title}</h3>
          </div>
        </div>
        {hasStreamlit ? (
          <a
            className="streamlit-button"
            href={fullUrl || streamlitUrl}
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
              Isi {configName} agar dashboard tampil di sini.
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
