import AnalysisPreview from "../components/dashboard/AnalysisPreview";

const BASE_STREAMLIT_URL =
  import.meta.env.VITE_STREAMLIT_URL ||
  "https://dashboardtransaksi.streamlit.app";

function DashboardPage() {
  const token = localStorage.getItem('token')
  
  const STREAMLIT_URL = token
  ? `${BASE_STREAMLIT_URL}/?token=${token}&embed=true`
  : null;
  const STREAMLIT_FULL_URL = token
  ? `${BASE_STREAMLIT_URL}/?token=${token}`  
  : null;

  return (
    <section className="dashboard-page-stack dashboard-embed-page grid grid-cols-1 gap-6 md:grid-cols-3">
      <header className="dashboard-section dashboard-section--embed md:col-span-3">
        <div className="dashboard-section-title">
          <div>
            <p className="dashboard-section-kicker">Dashboard</p>
            <h2>Dashboard Analitik</h2>
          </div>
        </div>
        <span>
          Dashboard analitik ditampilkan dari Streamlit dan memakai data backend.
        </span>
      </header>

      <section className="workspace-grid single-column grid grid-cols-1 gap-6 md:grid-cols-3 md:col-span-3">
        <div className="primary-column md:col-span-3">
          <AnalysisPreview 
            streamlitUrl={STREAMLIT_URL}
            fullUrl={STREAMLIT_FULL_URL}
          />
        </div>
      </section>
    </section>
  );
}

export default DashboardPage;
