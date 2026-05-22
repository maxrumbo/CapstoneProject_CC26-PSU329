import Icon from "../ui/Icon";

function DashboardHeader({
  eyebrow = "Workspace SAWIT",
  title = "Transaction Report",
  description = "Ringkasan pemasukan dan pengeluaran dari transaksi aktif.",
  icon = "dashboard",
  onProfileClick,
  userName = "",
}) {
  const displayName = userName.trim();
  const initial = displayName ? displayName[0].toUpperCase() : "";

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

      {displayName && (
        <button
          className="topbar-profile topbar-profile-button"
          type="button"
          aria-label={`Buka profil ${displayName}`}
          onClick={onProfileClick}
        >
          <span className="topbar-avatar" aria-hidden="true">
            {initial}
          </span>
          <div className="topbar-user">
            <span className="topbar-name">{displayName}</span>
          </div>
        </button>
      )}
    </header>
  );
}

export default DashboardHeader;
