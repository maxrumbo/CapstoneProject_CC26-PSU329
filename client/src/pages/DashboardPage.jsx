import AnalysisPreview from "../components/dashboard/AnalysisPreview";
import Icon from "../components/ui/Icon";

const DEFAULT_STREAMLIT_URL =
  "https://dashboardtransaksi.streamlit.app/?user_id=3&embed=true";

const STREAMLIT_URL =
  import.meta.env.VITE_STREAMLIT_URL || DEFAULT_STREAMLIT_URL;

function DashboardPage() {
  return (
    <>
      <header className="dashboard-section">
        <div className="dashboard-section-title">
          <span className="dashboard-section-icon" aria-hidden="true">
            <Icon name="dashboard" size={18} />
          </span>
          <div>
            <p className="dashboard-section-kicker">Dashboard</p>
            <h2>Dashboard Analitik</h2>
          </div>
        </div>
        <span>
          Dashboard analitik ditampilkan dari Streamlit dan memakai data backend.
        </span>
      </header>

      <section className="workspace-grid single-column">
        <div className="primary-column">
          <AnalysisPreview streamlitUrl={STREAMLIT_URL} />
        </div>
      </section>
    </>
  );
}

export default DashboardPage;
