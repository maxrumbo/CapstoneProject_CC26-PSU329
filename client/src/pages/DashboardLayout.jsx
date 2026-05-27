import { NavLink, Outlet, useNavigate } from "react-router-dom";
import BrandLogo from "../components/brand/BrandLogo";
import FloatingAnalisisAi from "../components/advice/FloatingAnalisisAi";
import Icon from "../components/ui/Icon";
import { useAuth } from "../context/useAuth";

const navItems = [
  {
    label: "Transactions",
    to: "/dashboard/transactions",
    icon: "receipt",
  },
  {
    label: "Subscriptions",
    to: "/dashboard/subscriptions",
    icon: "subscription",
  },
  {
    label: "Wishlist",
    to: "/dashboard/wishlist",
    icon: "target",
  },
  {
    label: "Investments",
    to: "/dashboard/investments",
    icon: "investment",
  },
];

function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.display_name || user?.email || "Akun SAWIT";
  const photoUrl = user?.photo_url || "";
  const initial = displayName.trim() ? displayName.trim()[0].toUpperCase() : "S";

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div className="dashboard-actions">
          <div className="dashboard-brand" aria-label="SAWIT">
            <BrandLogo variant="compact" />
          </div>

          <label className="dashboard-search">
            <span className="dashboard-search-icon">
              <Icon name="search" size={16} />
            </span>
            <input
              type="search"
              placeholder="Cari transaksi, kategori, atau insight"
              aria-label="Cari transaksi"
            />
          </label>

          <nav className="dashboard-nav" aria-label="Navigasi dashboard">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "dashboard-pill active" : "dashboard-pill"
                }
              >
                <span className="dashboard-pill-icon" aria-hidden="true">
                  <Icon name={item.icon} size={16} />
                </span>
                <span className="dashboard-pill-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive
                ? "dashboard-topbar-feature active"
                : "dashboard-topbar-feature"
            }
            aria-label="Buka Dashboard Analitik"
          >
            <span className="dashboard-topbar-icon" aria-hidden="true">
              <Icon name="dashboard" size={16} />
            </span>
            <span className="dashboard-topbar-title">Dashboard Analitik</span>
          </NavLink>

          <button
            className="dashboard-avatar"
            type="button"
            onClick={() => navigate("/dashboard/profile")}
            aria-label="Buka profil"
          >
            {photoUrl ? (
              <img
                className="dashboard-avatar-image"
                src={photoUrl}
                alt="Foto profil"
              />
            ) : (
              <span>{initial}</span>
            )}
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <Outlet />
      </main>

      <FloatingAnalisisAi />
    </div>
  );
}

export default DashboardLayout;
