function DashboardHeader({
  eyebrow = "Workspace SAWIT",
  title = "Transaction Report",
  description = "Ringkasan pemasukan dan pengeluaran dari transaksi aktif.",
}) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <span>{description}</span>
      </div>
    </header>
  );
}

export default DashboardHeader;
