function FeaturePreview({ features, onNavigate }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Rencana Fitur</p>
          <h3>Kebutuhan Keuangan</h3>
        </div>
      </div>

      <div className="feature-grid">
        {features.map((feature) => (
          <article
            className={feature.active ? "feature-card active" : "feature-card"}
            key={feature.title}
          >
            <h4>{feature.title}</h4>
            <p>{feature.description}</p>
            <button
              type="button"
              disabled={!feature.active}
              onClick={() => onNavigate(feature.page)}
            >
              {feature.active ? "Buka fitur" : "Belum aktif"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeaturePreview;
