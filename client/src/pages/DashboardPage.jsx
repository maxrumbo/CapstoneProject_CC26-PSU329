import AnalysisPreview from "../components/dashboard/AnalysisPreview";
import DashboardHeader from "../components/dashboard/DashboardHeader";

const DEFAULT_STREAMLIT_URL =
  "https://dashboardtransaksi.streamlit.app/?user_id=3&embed=true";

const STREAMLIT_URL =
  import.meta.env.VITE_STREAMLIT_URL || DEFAULT_STREAMLIT_URL;

function DashboardPage({ onProfileClick, userName }) {
  return (
    <>
      <DashboardHeader
        title="Dashboard Analitik"
        description="Dashboard analitik ditampilkan dari Streamlit dan memakai data backend."
        icon="dashboard"
        onProfileClick={onProfileClick}
        userName={userName}
      />

      <section className="workspace-grid single-column">
        <div className="primary-column">
          <AnalysisPreview streamlitUrl={STREAMLIT_URL} />
        </div>
      </section>
    </>
  );
}

export default DashboardPage;
