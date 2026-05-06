import Icon from "../ui/Icon";

function DashboardHeader({
  eyebrow = "Workspace SAWIT",
  title = "Transaction Report",
  description = "Ringkasan pemasukan dan pengeluaran dari transaksi aktif.",
  icon = "dashboard",
}) {
  return (
    <header className="topbar">
      <div className="topbar-content">
        <span className="topbar-icon">
          <Icon name={icon} size={20} />
        </span>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <span className="topbar-description">{description}</span>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
