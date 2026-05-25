import DashboardHeader from "../components/dashboard/DashboardHeader";
import SubscriptionTracker from "../features/subscriptions/components/SubscriptionTracker";

function SubscriptionPage({ onProfileClick, userName }) {
  return (
    <>
      <DashboardHeader
        eyebrow="Fitur Aktif"
        title="Subscription Tracker"
        description="Catat langganan aktif dan pantau total pengeluaran bulanannya."
        icon="subscription"
        onProfileClick={onProfileClick}
        userName={userName}
      />

      <section className="workspace-grid single-column">
        <div className="primary-column">
          <SubscriptionTracker />
        </div>
      </section>
    </>
  );
}

export default SubscriptionPage;
