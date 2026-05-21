import AnalysisPreview from "../components/dashboard/AnalysisPreview";
import DashboardHeader from "../components/dashboard/DashboardHeader";

const DEFAULT_STOCK_STREAMLIT_URL =
  "https://dashboardsahamlq45.streamlit.app/?embed=true";

const STOCK_STREAMLIT_URL =
  import.meta.env.VITE_STOCK_STREAMLIT_URL || DEFAULT_STOCK_STREAMLIT_URL;

function InvestmentPage({ onProfileClick, userName }) {
  return (
    <>
      <DashboardHeader
        title="Investasi"
        description="Dashboard saham LQ45 ditampilkan dari Streamlit."
        icon="investment"
        onProfileClick={onProfileClick}
        userName={userName}
      />

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
