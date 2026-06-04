import SubscriptionTracker from "../features/subscriptions/components/SubscriptionTracker";

function SubscriptionPage() {
  return (
    <>
      <header className="dashboard-section">
        <p className="dashboard-section-kicker">Subscription</p>
        <h2>Subscription Tracker</h2>
        <span>Catat langganan aktif dan pantau total pengeluaran bulanannya.</span>
      </header>

      <section className="workspace-grid single-column">
        <div className="primary-column">
          <SubscriptionTracker />
        </div>
      </section>
    </>
  );
}

export default SubscriptionPage;
