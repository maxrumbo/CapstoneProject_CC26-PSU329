import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/brand/BrandLogo";

/* ─── Icon Components ─── */
function IconTransaction({ color }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2-13H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
    </svg>
  );
}

function IconBrain({ color }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

function IconChart({ color }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IconTarget({ color }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconMoney({ color }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconBell({ color }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function IconTrendingUp({ color }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function IconLock({ color }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v2h12z" />
    </svg>
  );
}

/* ─── Social Icons ─── */
function IconWhatsApp() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.116-3.905 6.089-1.884 9.201 1.913 3.106 6.02 3.824 9.075 1.708l.014-.01c2.94-2.034 3.717-5.938 1.733-9.066-1.326-2.165-3.861-3.494-6.514-3.494l.007.001z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.756 0 8.333.012 7.053.07 2.695.272.273 2.69.07 7.052.012 8.333 0 8.756 0 12c0 3.244.012 3.667.07 4.947.202 4.358 2.625 6.78 6.986 6.982 1.281.058 1.704.07 4.947.07 3.243 0 3.666-.012 4.947-.07 4.358-.202 6.78-2.625 6.977-6.99.058-1.28.07-1.703.07-4.947 0-3.244-.012-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.012 15.259 0 12 0z" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M18.406 5.594a.75.75 0 11-1.06-1.061.75.75 0 011.06 1.06z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

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

/* ─── About Section Animated Blobs ─── */
function AboutBlobsBackground() {
  const blobs = Array.from({ length: 3 }).map((_, i) => {
    const rand = (n) => {
      const x = Math.sin((i + 5) * 777 + n) * 10000;
      return x - Math.floor(x);
    };
    return {
      size: 200 + rand(1) * 150,
      left: rand(2) * 80,
      top: 20 + rand(3) * 60,
      delay: rand(4) * 6,
      duration: 12 + rand(5) * 8,
      color: i === 0 ? "rgba(34, 197, 94, 0.15)" : i === 1 ? "rgba(245, 166, 35, 0.1)" : "rgba(96, 165, 250, 0.12)",
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {blobs.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.left}%`,
            top: `${blob.top}%`,
            background: blob.color,
            animation: `slowFloatBlob ${blob.duration}s ${blob.delay}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Services Section Grid Background ─── */
function ServicesGridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top-left accent glow */}
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(245, 166, 35, 0.15), transparent)" }} />
      
      {/* Bottom-right accent glow */}
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(34, 197, 94, 0.12), transparent)" }} />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-40"
        style={{
          background: "linear-gradient(45deg, transparent 0%, rgba(96, 165, 250, 0.05) 50%, transparent 100%)",
          animation: "slideGradient 15s ease-in-out infinite",
        }} />
    </div>
  );
}

/* ─── Contact Section Animated Rings ─── */
function ContactRingsBackground() {
  const rings = Array.from({ length: 4 }).map((_, i) => ({
    size: 100 + i * 120,
    delay: i * 0.3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
      {rings.map((ring, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: ring.size,
            height: ring.size,
            border: `1px solid rgba(${i % 2 === 0 ? "245, 166, 35" : "96, 165, 250"}, ${0.1 - i * 0.02})`,
            animation: `expandRing 4s ${ring.delay}s infinite ease-out`,
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
      <StatBadge className="-left-4 sm:-left-14" style={{ top: "40px" }} label="Net Worth" value="+24.8%" color="#22c55e" delay="0s" />
      <StatBadge className="-right-4 sm:-right-14" style={{ top: "130px" }} label="Target Reached" value="IDR 10M" color="#F5A623" delay="0.4s" />
      <StatBadge className="-left-4 sm:-left-12" style={{ bottom: "80px" }} label="Monthly Savings" value="+15%" color="#60a5fa" delay="0.8s" />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, accent }) {
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
      <div className="mb-4" style={{ color: accent }}>
        <Icon color={accent} />
      </div>
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
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0); opacity: 0.2; }
          50% { transform: translateY(-20px); opacity: 0.5; }
        }
        @keyframes slowFloatBlob {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -30px); }
          50% { transform: translate(0, 30px); }
          75% { transform: translate(-30px, -20px); }
        }
        @keyframes expandRing {
          0% { 
            opacity: 1;
            transform: scale(0.8);
          }
          100% { 
            opacity: 0;
            transform: scale(1.3);
          }
        }
        @keyframes slideGradient {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
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
                AI-POWERED PERSONAL FINANCE
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold leading-tight animate-fade-up text-white"
              style={{ fontFamily: "'Syne', sans-serif", animationDelay: "0.1s" }}>
              Master Your<br />
              <span className="gold-shimmer">Finances</span><br />
              Smarter.
            </h1>
            <p className="text-lg leading-relaxed max-w-md animate-fade-up text-gray-300"
              style={{ animationDelay: "0.2s" }}>
              SAWIT helps you track spending, plan savings, and make smarter money decisions
              with AI-powered insights built for personal finance.
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
              Track transactions, budgets, subscriptions, and financial goals in one place.
            </div>
          </div>
          {/* Right */}
          <div className="flex items-center justify-center md:w-1/2 md:justify-end animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <HeroCharacter />
          </div>
        </div>
        <button 
          onClick={() => scrollToSection('about')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group cursor-pointer transition-all duration-300 hover:opacity-100"
          style={{ opacity: 0.6 }}
          aria-label="Scroll to about section"
        >
          <span className="text-xs tracking-widest uppercase text-gray-300 group-hover:text-amber-400 transition-colors duration-300">Scroll</span>
          <div className="flex flex-col items-center gap-1 group-hover:translate-y-1 transition-transform duration-300">
            <div className="w-px h-6 bg-gradient-to-b from-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-px h-8 bg-linear-to-b from-white/40 to-transparent animate-bounce" style={{ animationDuration: '2s' }} />
            <div className="w-0.5 h-1 rounded-full bg-white/40 animate-pulse" />
          </div>
        </button>
      </section>

      {/* FEATURES */}
      <section id="about" className="relative py-24 px-4 sm:px-8 border-t border-white/5">
        <AboutBlobsBackground />
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-amber-500">About Us</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
              Built for smarter money management
            </h2>
            <p className="text-lg leading-relaxed text-gray-300 max-w-2xl">
              SAWIT is designed to help individuals manage daily cash flow, track spending,
              and turn raw transaction data into practical decisions for financial freedom.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard icon={IconTransaction} title="Transaction Tracking" desc="Record income and expenses with clear personal category summaries." accent="#F5A623" />
            <FeatureCard icon={IconBrain} title="AI Insights" desc="Get guidance based on patterns from your personal financial activity." accent="#22c55e" />
          </div>
        </div>
      </section>

      <section id="services" className="relative py-24 px-4 sm:px-8">
        <ServicesGridBackground />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-amber-500">Services</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Tools that support daily money decisions</h2>
            <p className="text-lg max-w-xl mx-auto text-gray-300">
              From cash flow and budgeting to recommendations and planning, everything stays in one personal dashboard.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={IconChart} title="AI Recommendations" desc="Practical suggestions based on transaction and budget trends." accent="#F5A623" />
            <FeatureCard icon={IconTarget} title="Savings Tracker" desc="Set savings targets and monitor progress over time." accent="#22c55e" />
            <FeatureCard icon={IconMoney} title="Budget Planning" desc="Set monthly budgets and review spending by category at a glance." accent="#60a5fa" />
            <FeatureCard icon={IconBell} title="Alerts" desc="Stay informed when spending or goal targets need attention." accent="#a78bfa" />
            <FeatureCard icon={IconTrendingUp} title="Portfolio Analytics" desc="Review investments and growth in one clear personal view." accent="#f472b6" />
            <FeatureCard icon={IconLock} title="Secure Records" desc="Keep financial data organized and protected for daily budgeting." accent="#34d399" />
          </div>
        </div>
      </section>

      <section id="contact" className="relative py-24 px-4 sm:px-8 border-t border-white/5">
        <ContactRingsBackground />
        <div className="relative z-10 max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-amber-500">CONTACT US</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            Let's connect and grow your financial future
          </h2>
          <p className="text-base sm:text-lg max-w-3xl mx-auto text-gray-300 mb-8">
            Have questions or want to stay updated? Reach out to us through our channels below.
          </p>
          
          {/* Social Icons */}
          <div className="flex justify-center gap-6 mt-8">
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full transition-all duration-300 hover:scale-110"
              style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(34, 197, 94, 0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(34, 197, 94, 0.1)"}
            >
              <IconWhatsApp />
            </a>
            <a 
              href="https://instagram.com/sahabatduwit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full transition-all duration-300 hover:scale-110"
              style={{ background: "rgba(245, 166, 35, 0.1)", color: "#F5A623" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(245, 166, 35, 0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(245, 166, 35, 0.1)"}
            >
              <IconInstagram />
            </a>
            <a 
              href="https://linkedin.com/company/sahabatduwit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full transition-all duration-300 hover:scale-110"
              style={{ background: "rgba(96, 165, 250, 0.1)", color: "#60a5fa" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(96, 165, 250, 0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(96, 165, 250, 0.1)"}
            >
              <IconLinkedIn />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 sm:px-8 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif", color: "#F5A623" }}>SAWIT</span>
        <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
          © {new Date().getFullYear()} SAWIT. All rights reserved. Built to empower your personal financial journey.
        </p>
      </footer>
    </div>
  );
}
