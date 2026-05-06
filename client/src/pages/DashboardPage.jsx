import AnalysisPreview from "../components/dashboard/AnalysisPreview";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import FeaturePreview from "../components/dashboard/FeaturePreview";
import SummaryReport from "../components/dashboard/SummaryReport";

function DashboardPage({ summary, features, bars, onNavigate }) {
  return (
    <>
      <DashboardHeader
        title="Dashboard SAWIT"
        description="Ringkasan pemasukan, pengeluaran, dan fitur keuangan yang tersedia."
        icon="dashboard"
      />
      <SummaryReport summary={summary} />

      <section className="workspace-grid">
        <div className="primary-column">
          <FeaturePreview features={features} onNavigate={onNavigate} />
        </div>

        <aside className="side-column">
          <AnalysisPreview bars={bars} />
        </aside>
      </section>
    </>
  );
}

export default DashboardPage;
