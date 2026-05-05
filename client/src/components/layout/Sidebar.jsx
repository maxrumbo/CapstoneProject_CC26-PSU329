function Sidebar({ menuItems, onCreateTransaction }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div>
          <h1>SAWIT</h1>
          <p>Sahabat Duwit</p>
        </div>
      </div>

      <button
        className="create-button"
        type="button"
        onClick={onCreateTransaction}
      >
        + Buat Transaksi
      </button>

      <nav className="menu" aria-label="Menu utama">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={item.active ? "menu-item active" : "menu-item"}
            type="button"
            disabled={!item.active}
          >
            <span>{item.label}</span>
            <small>{item.status}</small>
          </button>
        ))}
      </nav>

      <div className="project-card">
        <p>Project Plan</p>
        <strong>CC26-PSU329</strong>
      </div>
    </aside>
  );
}

export default Sidebar;
