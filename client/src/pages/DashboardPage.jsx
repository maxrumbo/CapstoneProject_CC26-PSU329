import AnalysisPreview from "../components/dashboard/AnalysisPreview";
import DashboardHeader from "../components/dashboard/DashboardHeader";
const STREAMLIT_URL = import.meta.env.VITE_STREAMLIT_URL || "";

function DashboardPage({ userName }) {
  return (
    <>
      <DashboardHeader
        title="Dashboard Analitik"
        description="Dashboard analitik akan ditampilkan melalui Streamlit."
        icon="dashboard"
        userName={userName}
      />

      <section className="workspace-grid">
        <div className="primary-column">
          <AnalysisPreview streamlitUrl={STREAMLIT_URL} />
        </div>
      </section>
    </>
  );
}

export default DashboardPage;
