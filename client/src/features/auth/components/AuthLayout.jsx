import BrandLogo from "../../../components/brand/BrandLogo";
import Icon from "../../../components/ui/Icon";

const authBenefits = [
  { label: "Kategorisasi transaksi otomatis", icon: "tag" },
  { label: "Wishlist Calculator", icon: "target" },
  { label: "AI recommendation", icon: "ai" },
  { label: "Dashboard analitik", icon: "dashboard" },
];

function AuthLayout({ children }) {
  return (
    <section className="auth-layout" aria-label="Authentication">
      <div className="auth-brand-panel">
        <BrandLogo className="auth-brand-logo" variant="lockup" />
        <p className="auth-kicker">SAWIT</p>
        <h1>Sahabat Duwit</h1>
        <strong>Kelola uangmu tanpa pusing.</strong>
        <p>
          Catat transaksi, hitung target wishlist, dan pahami pola
          pengeluaranmu dengan insight berbasis data.
        </p>

        <ul className="auth-benefits">
          {authBenefits.map((benefit) => (
            <li key={benefit.label}>
              <span className="auth-benefit-icon">
                <Icon name={benefit.icon} size={14} />
              </span>
              {benefit.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="auth-form-panel">{children}</div>
    </section>
  );
}

export default AuthLayout;
