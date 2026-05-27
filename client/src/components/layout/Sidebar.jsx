import BrandLogo from "../brand/BrandLogo";
import Icon from "../ui/Icon";

function Sidebar({
  menuItems,
  currentPage,
  onCreateTransaction,
  onNavigate,
  onPreload,
  onResizeByKeyboard,
  onResizeStart,
  onLogout,
}) {
  const handleResizeKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onResizeByKeyboard(-16);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      onResizeByKeyboard(16);
    }
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <BrandLogo variant="mark" />
        <div>
          <h1>SAWIT</h1>
          <p>Sahabat Duwit</p>
        </div>
      </div>

      <button
        className="create-button"
        type="button"
        onClick={onCreateTransaction}
        onFocus={() => onPreload("transactions")}
        onMouseEnter={() => onPreload("transactions")}
      >
        <span className="button-content">
          <Icon name="plus" size={16} />
          Buat Transaksi
        </span>
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
              onFocus={() => item.page && onPreload(item.page)}
              onMouseEnter={() => item.page && onPreload(item.page)}
            >
              <span className="menu-item-main">
                <Icon name={item.icon} size={16} />
                <span className="menu-item-label">{item.label}</span>
              </span>
              <small>{item.status}</small>
            </button>
          );
        })}
      </nav>

      {onLogout && (
        <div className="sidebar-footer">
          <button className="logout-button" type="button" onClick={onLogout}>
            <span className="button-content">
              <Icon name="arrowRight" size={16} />
              Keluar
            </span>
          </button>
        </div>
      )}

      <button
        aria-label="Geser lebar sidebar"
        className="sidebar-resize-handle"
        title="Geser lebar sidebar"
        type="button"
        onKeyDown={handleResizeKeyDown}
        onPointerDown={onResizeStart}
      />
    </aside>
  );
}

export default Sidebar;
