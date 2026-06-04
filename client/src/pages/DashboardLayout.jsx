import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
  const photoUrl = user?.photo_url || "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search state (adapted from WelcomePage search behavior)
  const [searchValue, setSearchValue] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const searchMessageTimerRef = useRef(null);
  const lastSearchQueryRef = useRef("");
  const activeMatchIndexRef = useRef(0);

  useEffect(() => {
    return () => {
      if (searchMessageTimerRef.current) {
        window.clearTimeout(searchMessageTimerRef.current);
      }
    };
  }, []);

  const normalizeSearchText = (value) =>
    value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  const clearSearchHighlights = () => {
    const spans = Array.from(document.querySelectorAll(".search-highlight"));
    spans.forEach((s) => {
      const txt = document.createTextNode(s.textContent);
      s.parentNode.replaceChild(txt, s);
    });
    lastSearchQueryRef.current = "";
    activeMatchIndexRef.current = 0;
  };

  const getMatchSpans = () => Array.from(document.querySelectorAll(".search-highlight"));

  const setActiveMatch = (index) => {
    const list = getMatchSpans();
    if (list.length === 0) return 0;

    const safeIndex = ((index % list.length) + list.length) % list.length;
    list.forEach((el, currentIndex) => {
      el.classList.toggle("search-highlight-active", currentIndex === safeIndex);
    });

    const active = list[safeIndex];
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    activeMatchIndexRef.current = safeIndex;
    return list.length;
  };

  const findAndHighlight = (q) => {
    clearSearchHighlights();
    if (!q) return 0;
    const all = Array.from(document.querySelectorAll("body *"));
    const matches = all.filter((el) => {
      if (!el || !el.textContent) return false;
      const tag = el.tagName.toLowerCase();
      if (tag === "script" || tag === "style" || tag === "svg" || tag === "path") return false;
      const style = window.getComputedStyle(el);
      if (style && (style.display === "none" || style.visibility === "hidden" || style.opacity === "0")) return false;
      if (el.children && el.children.length > 0) {
        if (el.children.length > 3) return false;
      }
      return el.textContent.toLowerCase().includes(q);
    });

    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapeRegExp(q), "ig");
    let total = 0;

    for (const el of matches) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      const textNodes = [];
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
      }
      textNodes.forEach((node) => {
        if (!node.nodeValue) return;
        const originalText = node.nodeValue;
        if (!regex.test(originalText)) return;

        regex.lastIndex = 0;
        const replaced = originalText.replace(regex, (match) => `<span class="search-highlight">${match}</span>`);
        const temp = document.createElement("span");
        temp.innerHTML = replaced;
        while (temp.firstChild) {
          node.parentNode.insertBefore(temp.firstChild, node);
        }
        node.parentNode.removeChild(node);
        const count = (originalText.match(new RegExp(escapeRegExp(q), "ig")) || []).length;
        total += count;
      });
    }

    if (total > 0) {
      setActiveMatch(0);
    }

    return total;
  };

  const cycleSearchMatch = (direction) => {
    const list = getMatchSpans();
    if (list.length === 0) return false;
    const nextIndex = activeMatchIndexRef.current + direction;
    setActiveMatch(nextIndex);
    return true;
  };

  const handleSearchSubmit = (event) => {
    event?.preventDefault?.();
    if (searchMessageTimerRef.current) {
      window.clearTimeout(searchMessageTimerRef.current);
      searchMessageTimerRef.current = null;
    }

    const normalized = normalizeSearchText(searchValue);

    if (!normalized) {
      clearSearchHighlights();
      setSearchMessage("");
      return;
    }

    if (normalized === lastSearchQueryRef.current && cycleSearchMatch(1)) {
      setSearchMessage("");
      return;
    }

    clearSearchHighlights();
    const count = findAndHighlight(normalized);
    if (count <= 0) {
      setSearchMessage("No direct match found.");
      lastSearchQueryRef.current = "";
    } else {
      setSearchMessage("");
      lastSearchQueryRef.current = normalized;
    }

    searchMessageTimerRef.current = window.setTimeout(() => {
      setSearchMessage("");
      searchMessageTimerRef.current = null;
    }, 2200);
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-shell-glow dashboard-shell-glow-left" aria-hidden="true" />
      <div className="dashboard-shell-glow dashboard-shell-glow-right" aria-hidden="true" />

      <header className="dashboard-topbar">
        <div className="dashboard-topbar-surface flex flex-col gap-3 md:gap-0">
          <div className="dashboard-actions">
            <div className="dashboard-brand" aria-label="SAWIT">
              <BrandLogo variant="compact" />
            </div>

            <form
              className="dashboard-search dashboard-mobile-search md:hidden"
              onSubmit={handleSearchSubmit}
              role="search"
            >
              <span className="dashboard-search-icon">
                <Icon name="search" size={16} />
              </span>
              <input
                type="search"
                placeholder="Cari transaksi..."
                aria-label="Cari transaksi"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0"
              />
              {searchMessage ? <div className="dashboard-search-message">{searchMessage}</div> : null}
            </form>

            <button
              className="dashboard-avatar dashboard-mobile-avatar md:hidden"
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
                <span className="dashboard-avatar-icon">
                  <Icon name="user" size={16} />
                </span>
              )}
            </button>

            <button
              type="button"
              className="dashboard-menu-toggle md:hidden inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
              aria-label="Buka menu navigasi"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Fitur</span>
            </button>

            <div className="dashboard-desktop-bar hidden md:grid">
              <form className="dashboard-search" onSubmit={handleSearchSubmit} role="search">
                <span className="dashboard-search-icon">
                  <Icon name="search" size={16} />
                </span>
                <input
                  type="search"
                  placeholder="Cari transaksi, kategori, atau insight"
                  aria-label="Cari transaksi"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="bg-transparent border-none outline-none focus:ring-0"
                />
                {searchMessage ? <div className="dashboard-search-message">{searchMessage}</div> : null}
              </form>

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

              <div className="dashboard-right-tools">
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
                    <span className="dashboard-avatar-icon">
                      <Icon name="user" size={16} />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className={`${mobileMenuOpen ? "flex" : "hidden"} dashboard-mobile-menu-panel md:hidden flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md`}>
            <nav className="grid grid-cols-2 gap-2" aria-label="Navigasi dashboard mobile">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `${isActive ? "dashboard-pill active" : "dashboard-pill"} w-full justify-center`
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
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `${isActive ? "dashboard-topbar-feature active" : "dashboard-topbar-feature"} w-full justify-center`
              }
              aria-label="Buka Dashboard Analitik"
            >
              <span className="dashboard-topbar-icon" aria-hidden="true">
                <Icon name="dashboard" size={16} />
              </span>
              <span className="dashboard-topbar-title">Dashboard Analitik</span>
            </NavLink>
          </div>
        </div>
      </header>

      <main className="dashboard-content px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <FloatingAnalisisAi />
    </div>
  );
}

export default DashboardLayout;
