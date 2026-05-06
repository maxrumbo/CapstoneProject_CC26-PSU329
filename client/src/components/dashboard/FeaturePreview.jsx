import Icon from "../ui/Icon";

function FeaturePreview({ features, onNavigate }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">
            <Icon name="ai" size={18} />
          </span>
          <div>
            <p className="eyebrow">Rencana Fitur</p>
            <h3>Kebutuhan Keuangan</h3>
          </div>
        </div>
      </div>

      <div className="feature-grid">
        {features.map((feature) => (
          <article
            className={feature.active ? "feature-card active" : "feature-card"}
            key={feature.title}
          >
            <span className="feature-icon">
              <Icon name={feature.icon} size={18} />
            </span>
            <h4>{feature.title}</h4>
            <p>{feature.description}</p>
            <button
              type="button"
              disabled={!feature.active}
              onClick={() => onNavigate(feature.page)}
            >
              <span className="button-content">
                <Icon name={feature.active ? "arrowRight" : "clock"} size={14} />
                {feature.active ? "Buka fitur" : "Belum aktif"}
              </span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeaturePreview;
