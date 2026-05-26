import AnalysisPreview from "../components/dashboard/AnalysisPreview";

const DEFAULT_STOCK_STREAMLIT_URL =
  "https://dashboardsahamlq45.streamlit.app/?embed=true";

const STOCK_STREAMLIT_URL =
  import.meta.env.VITE_STOCK_STREAMLIT_URL || DEFAULT_STOCK_STREAMLIT_URL;

function InvestmentPage() {
  return (
    <>
      <header className="dashboard-section">
        <p className="dashboard-section-kicker">Insight</p>
        <h2>Investasi</h2>
        <span>Dashboard saham LQ45 ditampilkan dari Streamlit.</span>
      </header>

      <section className="workspace-grid single-column">
        <div className="primary-column">
          <AnalysisPreview
            configName="VITE_STOCK_STREAMLIT_URL"
            eyebrow="Dashboard Saham"
            icon="investment"
            streamlitUrl={STOCK_STREAMLIT_URL}
            title="LQ45 Stock Analytics"
          />
        </div>
      </section>
    </>
  );
}

export default InvestmentPage;
