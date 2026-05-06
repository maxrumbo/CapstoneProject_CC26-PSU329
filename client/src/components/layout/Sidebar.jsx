function Sidebar({ menuItems, currentPage, onCreateTransaction, onNavigate }) {
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
        {menuItems.map((item) => {
          const isCurrentPage = item.page === currentPage;

          return (
            <button
              key={item.label}
              className={isCurrentPage ? "menu-item active" : "menu-item"}
              type="button"
              aria-current={isCurrentPage ? "page" : undefined}
              disabled={!item.active || !item.page}
              onClick={() => onNavigate(item.page)}
            >
              <span>{item.label}</span>
              <small>{item.status}</small>
            </button>
          );
        })}
      </nav>

      <div className="project-card">
        <p>Capstone Project</p>
        <strong>CC26-PSU329</strong>
      </div>
    </aside>
  );
}

export default Sidebar;
