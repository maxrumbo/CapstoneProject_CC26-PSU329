import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/brand/BrandLogo";

const landingSections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
];

/* ─── Floating particle background ─── */
function ParticleField() {
  const particles = Array.from({ length: 24 }).map((_, i) => {
    // Deterministic pseudo-random values based on index to keep render pure.
    const rand = (n) => {
      const x = Math.sin((i + 1) * 999 + n) * 10000;
      return x - Math.floor(x);
    };

    const w = rand(1) * 6 + 2;
    const h = rand(2) * 6 + 2;
    const left = rand(3) * 100;
    const top = rand(4) * 100;
    const delay = rand(5) * 8;
    const duration = 6 + rand(6) * 8;

    return {
      key: i,
      w,
      h,
      left,
      top,
      background: i % 3 === 0 ? "#F5A623" : i % 3 === 1 ? "#4ade80" : "#60a5fa",
      delay,
      duration,
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.key}
          className="absolute rounded-full opacity-30"
          style={{
            width: p.w,
            height: p.h,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: p.background,
            animation: `floatParticle ${p.duration}s ${p.delay}s infinite ease-in-out alternate`,
          }}
        />
      ))}
    </div>
  );
}

function StatBadge({ className, label, value, color, delay }) {
  return (
    <div
      className={`${className} absolute px-3 py-2 rounded-xl text-xs z-20`}
      style={{
        background: "rgba(20,25,30,0.85)",
        border: `1px solid ${color}40`,
        boxShadow: `0 4px 24px ${color}20`,
        backdropFilter: "blur(12px)",
        animation: `floatCard ease-in-out 3s ${delay} infinite`,
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.5)" }}>{label}</div>
      <div className="font-bold mt-0.5" style={{ color }}>{value}</div>
    </div>
  );
}

function HeroCharacter() {
  return (
    <div className="relative flex flex-col items-center justify-end select-none" style={{ width: "420px", height: "480px" }}>
      <div className="absolute inset-0 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #F5A623 0%, #22c55e 60%, transparent 100%)" }} />

      <div className="relative z-10 hero-frame overflow-hidden" style={{ width: "360px", height: "420px" }}>
        <img src="/3Dpict.svg" alt="3D Character" className="hero-3dpict" />
      </div>

      <div className="w-48 h-10 mt-1 rounded-full blur-xl"
        style={{ background: "radial-gradient(ellipse, rgba(245,166,35,0.5) 0%, transparent 70%)" }} />
      <StatBadge className="-left-4 sm:-left-14" style={{ top: "40px" }} label="Portfolio" value="+24.8%" color="#22c55e" delay="0s" />
      <StatBadge className="-right-4 sm:-right-14" style={{ top: "130px" }} label="Palm Oil" value="IDR 12.4K" color="#F5A623" delay="0.4s" />
      <StatBadge className="-left-4 sm:-left-12" style={{ bottom: "80px" }} label="Yield" value="8.2 t/ha" color="#60a5fa" delay="0.8s" />
    </div>
  );
}

function FeatureCard({ icon, title, desc, accent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="p-6 rounded-2xl transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: hovered ? `1px solid ${accent}40` : "1px solid rgba(255,255,255,0.08)",
        boxShadow: hovered ? `0 0 32px ${accent}22` : "none",
        transform: hovered ? "translateY(-4px)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
        style={{ background: `${accent}18` }}>{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-300">{desc}</p>
    </div>
  );
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const searchMessageTimerRef = useRef(null);
  const lastSearchQueryRef = useRef("");
  const activeMatchIndexRef = useRef(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });

    return () => {
      if (searchMessageTimerRef.current) {
        window.clearTimeout(searchMessageTimerRef.current);
      }
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const normalizeSearchText = (value) => value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  // Clear previous highlights added by the search (unwrap highlight spans)
  const clearSearchHighlights = () => {
    // remove inline highlight spans
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

    // Search visible elements that contain text and are not too large containers
    const all = Array.from(document.querySelectorAll("body *"));
    const matches = all.filter((el) => {
      if (!el || !el.textContent) return false;
      // skip script, style, SVG path, and hidden elements
      const tag = el.tagName.toLowerCase();
      if (tag === "script" || tag === "style" || tag === "svg" || tag === "path") return false;
      const style = window.getComputedStyle(el);
      if (style && (style.display === "none" || style.visibility === "hidden" || style.opacity === "0")) return false;
      // prefer leaf-ish nodes to avoid highlighting whole layout containers
      if (el.children && el.children.length > 0) {
        // allow small containers with few children
        if (el.children.length > 3) return false;
      }
      return el.textContent.toLowerCase().includes(q);
    });

    // wrap all matched substrings in text nodes inside the first matching sections
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
    event.preventDefault();

    if (searchMessageTimerRef.current) {
      window.clearTimeout(searchMessageTimerRef.current);
      searchMessageTimerRef.current = null;
    }

    const normalized = normalizeSearchText(searchValue);

    if (!normalized) {
      // empty search: clear highlights and message
      clearSearchHighlights();
      setSearchMessage("");
      return;
    }

    // First try landing sections (exact/partial)
    const landingMatch = landingSections.find((s) => {
      const label = s.label.toLowerCase();
      return (
        normalized === s.id ||
        normalized === label ||
        normalized.includes(s.id) ||
        normalized.includes(label) ||
        label.includes(normalized)
      );
    });

    if (landingMatch) {
      clearSearchHighlights();
      setSearchMessage("");
      scrollToSection(landingMatch.id);
      return;
    }

    if (normalized === lastSearchQueryRef.current && cycleSearchMatch(1)) {
      setSearchMessage("");
      return;
    }

    // Otherwise perform page-find style search and highlight matched words
    clearSearchHighlights();
    const count = findAndHighlight(normalized);
    if (count <= 0) {
      setSearchMessage("No direct match found.");
      lastSearchQueryRef.current = "";
    } else {
      setSearchMessage("");
      lastSearchQueryRef.current = normalized;
    }

    // hide transient text-only message after delay, keep highlights/nav unless cleared
    searchMessageTimerRef.current = window.setTimeout(() => {
      setSearchMessage("");
      searchMessageTimerRef.current = null;
    }, 2200);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#0F1419", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
    setSearchMessage("No result found");
        @keyframes float {
          0%, 100% { transform: translateY(0); opacity: 0.2; }
          50% { transform: translateY(-20px); opacity: 0.5; }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-float { animation: float linear infinite; }
        .animate-fade-up { animation: fadeUp 0.7s ease both; }
        .gold-shimmer {
          background: linear-gradient(90deg, #F5A623, #ffd080, #F5A623);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <header className="welcome-topbar">
        <a className="welcome-topbar-logo" href="#home" aria-label="Go to home">
          <BrandLogo className="welcome-topbar-logo-mark" variant="lockup" />
        </a>

        <nav className="welcome-topbar-nav" aria-label="Primary">
          {landingSections.map((section) => (
            <a key={section.id} className="welcome-topbar-link" href={`#${section.id}`}>
              {section.label}
            </a>
          ))}
        </nav>

        <form className="welcome-searchbar" role="search" aria-label="Search SAWIT" onSubmit={handleSearchSubmit}>
          <svg className="welcome-searchbar-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          </svg>
          <input
            type="search"
            placeholder="Search Home, Services, Contact..."
            aria-label="Search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          {searchMessage ? <div className="welcome-search-message">{searchMessage}</div> : null}
        </form>
        {/* profile button removed from welcome topbar */}
      </header>
      

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center pt-24 py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.2), transparent)" }} />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(245,166,35,0.15), transparent)" }} />
        </div>
        <ParticleField />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row gap-16 items-center justify-between w-full">
          {/* Left */}
          <div className="flex flex-col gap-6 md:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full w-fit animate-fade-up"
              style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)", animationDelay: "0s" }}>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-500">
                AI-Powered Palm Oil Finance
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold leading-tight animate-fade-up text-white"
              style={{ fontFamily: "'Syne', sans-serif", animationDelay: "0.1s" }}>
              Grow Your<br />
              <span className="gold-shimmer">Palm Estate</span><br />
              Smarter.
            </h1>
            <p className="text-lg leading-relaxed max-w-md animate-fade-up text-gray-300"
              style={{ animationDelay: "0.2s" }}>
              SAWIT helps Indonesian palm oil stakeholders track cash flow, forecast yields,
              and make smarter financial decisions with AI-powered insights.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={() => navigate("/auth?mode=register")}
                className="group px-8 py-3.5 rounded-full font-bold text-base flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 text-yellow-950"
                style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", boxShadow: "0 8px 32px rgba(245,166,35,0.45)" }}>
                Get Started Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/auth?mode=login")}
                className="px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 hover:bg-white/10 text-gray-300 border border-gray-600">
                View Demo
              </button>
            </div>
            <div className="animate-fade-up text-sm max-w-md text-gray-400" style={{ animationDelay: "0.4s" }}>
              Track transactions, budgets, subscriptions, and investment plans in one place.
            </div>
          </div>
          {/* Right */}
          <div className="flex items-center justify-center md:w-1/2 md:justify-end animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <HeroCharacter />
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs tracking-widest uppercase text-gray-300">Scroll</span>
          <div className="w-px h-10 bg-linear-to-b from-white/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* FEATURES */}
      <section id="about" className="relative py-24 px-4 sm:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-amber-500">About Us</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
              Built for the business side of palm oil
            </h2>
            <p className="text-lg leading-relaxed text-gray-300 max-w-2xl">
              SAWIT is designed to help plantation owners and financial teams manage daily cash flow,
              track spending, and turn raw transaction data into practical decisions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard icon="📒" title="Transaction Tracking" desc="Record income and expenses with clear category summaries." accent="#F5A623" />
            <FeatureCard icon="🧠" title="AI Insights" desc="Get recommendations based on patterns from your financial activity." accent="#22c55e" />
          </div>
        </div>
      </section>

      <section id="services" className="relative py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-amber-500">Services</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Tools that support daily decisions</h2>
            <p className="text-lg max-w-xl mx-auto text-gray-300">
              From cash flow and budgeting to recommendations and planning, everything stays in one dashboard.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon="📊" title="AI Recommendations" desc="Practical financial suggestions based on transaction and budget trends." accent="#F5A623" />
            <FeatureCard icon="🌿" title="Yield Tracker" desc="Record harvest updates and monitor output over time." accent="#22c55e" />
            <FeatureCard icon="💸" title="Budget Planning" desc="Set monthly budgets and see spending by category at a glance." accent="#60a5fa" />
            <FeatureCard icon="🔔" title="Alerts" desc="Stay informed when spending or plan targets need attention." accent="#a78bfa" />
            <FeatureCard icon="📈" title="Portfolio Analytics" desc="Review investments and performance in one business view." accent="#f472b6" />
            <FeatureCard icon="🔒" title="Secure Records" desc="Keep financial data organized and protected for daily use." accent="#34d399" />
          </div>
        </div>
      </section>

      <section id="contact" className="relative py-24 px-4 sm:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-amber-500">Contact</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            Need help with your account or dashboard?
          </h2>
          <p className="text-base sm:text-lg max-w-3xl mx-auto text-gray-300">
            Use the login page to access your account, then manage transactions, wishlist planning,
            subscriptions, and recommendations from the dashboard.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 sm:px-8 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif", color: "#F5A623" }}>sawit</span>
        <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
          © {new Date().getFullYear()} SAWIT. All rights reserved. Built for Indonesian palm oil stakeholders.
        </p>
      </footer>
    </div>
  );
}
