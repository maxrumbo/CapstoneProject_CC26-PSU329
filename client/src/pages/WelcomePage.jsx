import { Link } from "react-router-dom";
import BrandLogo from "../components/brand/BrandLogo";
import Icon from "../components/ui/Icon";

function WelcomePage() {
  return (
    <div className="welcome-shell">
      <div className="welcome-gradient" aria-hidden="true" />
      <div className="welcome-logo">
        <BrandLogo variant="lockup" />
      </div>
      <main className="welcome-layout">
        <section className="welcome-copy">
          <h1>Tenangin uang harianmu, rapiin langkah investasimu.</h1>
          <p>
            SAWIT membantu kamu mencatat transaksi, memantau langganan, dan
            memvisualisasikan pola keuangan dengan cara yang presisi dan ringan.
          </p>
          <div className="welcome-actions">
            <Link className="welcome-button" to="/auth?mode=signin">
              Sign In
            </Link>
            <Link className="welcome-button secondary" to="/auth?mode=signup">
              Sign Up
            </Link>
          </div>
          <div className="welcome-metrics">
            <div>
              <strong>+5 Kategori</strong>
              <span>Pengeluaran utama</span>
            </div>
            <div>
              <strong>Realtime</strong>
              <span>Ringkas transaksi</span>
            </div>
            <div>
              <strong>Insight</strong>
              <span>AI & analitik</span>
            </div>
          </div>
        </section>

        <section className="welcome-visual" aria-label="Pratinjau dashboard">
          <div className="welcome-card">
            <div className="welcome-card-header">
              <span className="welcome-pill">Portfolio</span>
              <span className="welcome-chip">
                <Icon name="ai" size={14} />
                Premium Mode
              </span>
            </div>
            <div className="welcome-card-body">
              <div className="welcome-balance">
                <span>Saldo Bulan Ini</span>
                <strong>Rp 12.450.000</strong>
              </div>
              <div className="welcome-bars" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="welcome-footnotes">
                <span>Langganan aktif: 4</span>
                <span>Wishlist target: 3</span>
              </div>
            </div>
          </div>
          <div className="welcome-orbit" aria-hidden="true" />
        </section>
      </main>
    </div>
  );
}

export default WelcomePage;
