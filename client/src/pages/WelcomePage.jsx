import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/brand/BrandLogo";
import AnimatedAiLogo from "../components/brand/AnimatedAiLogo";

/* ─── Icon Components ─── */
function IconTransaction({ color }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2-13H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
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
    <svg className="w-6 h-6" viewBox="0 0 448 512" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M380.9 97.1c-41.9-42-97.7-65.1-157-65.1-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27l.1 0c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-102.8 83.6-186.4 186.4-186.4 49.8 0 96.6 19.4 131.9 54.6s54.6 82.1 54.6 131.9c0 102.8-83.6 186.4-186.4 186.4zm101.5-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.5 21.7-6.4 4.2-11.9 1.4c-5.5-2.8-23.3-8.6-44.4-27.4-16.4-14.6-27.5-32.7-30.7-38.2-3.2-5.5-.3-8.5 2.4-11.3 2.5-2.4 5.5-6.4 8.2-9.6 2.8-3.2 3.7-5.5 5.5-9.1 1.8-3.7 .9-6.8-.4-9.6-1.4-2.8-12.5-30.1-17.1-41.3-4.5-10.8-9.1-9.3-12.5-9.4l-10.6-.2c-3.7 0-9.6 1.4-14.7 6.8s-19.7 19.2-19.7 46.8 20.2 54.3 23 58c2.8 3.7 39.5 60.4 95.8 84.8 13.4 5.8 23.9 9.3 32 12 13.5 4.3 25.8 3.6 35.5 2.2 10.8-1.6 33.3-13.6 38-26.8 4.7-13.2 4.7-24.4 3.3-26.8-1.4-2.4-5.1-3.8-10.6-6.6z"
      />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 448 512" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M224.1 141c-63.6 0-115.1 51.5-115.1 115.1S160.5 371.2 224.1 371.2 339.2 319.7 339.2 256.1 287.7 141 224.1 141zm0 190.1c-41.4 0-75-33.6-75-75s33.6-75 75-75 75 33.6 75 75-33.6 75-75 75zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.2s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9 26.2 26.2 58 34.4 93.9 36.2 37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.9zm-48.5 224.1c-7.8 19.6-23 34.9-42.6 42.6-29.5 11.7-99.6 9-132.1 9s-102.6 2.6-132.1-9c-19.6-7.8-34.9-23-42.6-42.6-11.7-29.5-9-99.6-9-132.1s-2.6-102.6 9-132.1c7.8-19.6 23-34.9 42.6-42.6 29.5-11.7 99.6-9 132.1-9s102.6-2.6 132.1 9c19.6 7.8 34.9 23 42.6 42.6 11.7 29.5 9 99.6 9 132.1s2.7 102.6-9 132.1z"
      />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 448 512" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3C448 46.5 433.6 32 416 32zM135.4 416H69.1V202.2h66.3V416zm-33.2-243.3c-21.2 0-38.4-17.2-38.4-38.4s17.2-38.4 38.4-38.4 38.4 17.2 38.4 38.4-17.2 38.4-38.4 38.4zM384.3 416H318V314.4c0-24.3-.5-55.6-33.9-55.6-34 0-39.2 26.5-39.2 53.9V416h-66.2V202.2h63.6v29.2h.9c8.9-16.9 30.7-34.7 63.2-34.7 67.6 0 80.1 44.5 80.1 102.3V416z"
      />
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
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(245, 166, 35, 0.15), transparent)" }} />
      
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(34, 197, 94, 0.12), transparent)" }} />
      
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
      className={`${className} absolute px-2.5 py-2 rounded-xl text-[11px] z-20`}
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
    <div className="relative flex flex-col items-center justify-end select-none" style={{ width: "340px", height: "400px" }}>
      <div className="absolute inset-0 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #F5A623 0%, #22c55e 60%, transparent 100%)" }} />

      <div className="relative z-10 hero-frame overflow-hidden" style={{ width: "286px", height: "340px" }}>
        <img src={`${import.meta.env.BASE_URL}IconLandingPage.svg`} alt="3D Character" className="hero-3dpict" />
      </div>

      <div className="w-36 h-8 mt-1 rounded-full blur-xl"
        style={{ background: "radial-gradient(ellipse, rgba(245,166,35,0.5) 0%, transparent 70%)" }} />
      <StatBadge className="-left-2 sm:-left-8" style={{ top: "46px" }} label="Net Worth" value="+24.8%" color="#22c55e" delay="0s" />
      <StatBadge className="-right-2 sm:right-4" style={{ top: "122px" }} label="Target Reached" value="IDR 10M" color="#F5A623" delay="0.4s" />
      <StatBadge className="-left-2 sm:-left-6" style={{ bottom: "72px" }} label="Monthly Savings" value="+15%" color="#60a5fa" delay="0.8s" />
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
  const badgeText = "AI-POWERED PERSONAL FINANCE";
  const [searchValue, setSearchValue] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [typedBadgeText, setTypedBadgeText] = useState(badgeText);
  const [isMobile, setIsMobile] = useState(false);
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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

  useEffect(() => {
    // Matikan efek ketik jika di mobile agar tampilan box tidak menyusut (bantet)
    if (isMobile) {
      // Guard to avoid calling setState synchronously unconditionally
      // which triggers the eslint `set-state-in-effect` warning and
      // can cause unnecessary cascading renders.
      if (typedBadgeText !== badgeText) {
        setTypedBadgeText(badgeText);
      }
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    let charIndex = 0;
    let deleting = false;
    let timeoutId = null;

    const tick = () => {
      if (!deleting) {
        charIndex += 1;
        setTypedBadgeText(badgeText.slice(0, charIndex));

        if (charIndex >= badgeText.length) {
          deleting = true;
          timeoutId = window.setTimeout(tick, 2500); // Jeda sebelum teks dihapus
          return;
        }

        timeoutId = window.setTimeout(tick, 80);
        return;
      }

      charIndex -= 1;
      setTypedBadgeText(badgeText.slice(0, Math.max(charIndex, 0)));

      if (charIndex <= 0) {
        deleting = false;
        timeoutId = window.setTimeout(tick, 350);
        return;
      }

      timeoutId = window.setTimeout(tick, 45);
    };

    timeoutId = window.setTimeout(tick, 450);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [badgeText, isMobile, typedBadgeText]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const normalizeSearchText = (value) => value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

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
    event.preventDefault();

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
        @keyframes caretBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .animate-float { animation: float linear infinite; }
        .animate-fade-up { animation: fadeUp 0.7s ease both; }
        .type-caret { animation: caretBlink 0.9s steps(1, end) infinite; }
        .gold-shimmer {
          background: linear-gradient(90deg, #F5A623, #ffd080, #F5A623);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <header className={isMobile ? "w-full flex items-center justify-center pt-2 pb-0 bg-transparent" : "welcome-topbar"}>
        <a 
          href="#home" 
          aria-label="Go to home"
          className={isMobile ? "flex items-center justify-center" : "welcome-topbar-logo"}
        >
          <div style={isMobile ? { transform: "scale(1.3)", transformOrigin: "center", display: "flex" } : {}}>
            <BrandLogo className="welcome-topbar-logo-mark" variant="lockup" />
          </div>
        </a>

        {!isMobile && (
          <>
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
          </>
        )}
      </header>
      
      {/* HERO */}
      <section
        id="home"
        className={isMobile ? "relative min-h-screen flex items-center pt-6 pb-10" : "relative min-h-screen flex items-center pt-28 pb-20"}
        style={isMobile ? { marginTop: "-28px" } : undefined}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.2), transparent)" }} />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(245,166,35,0.15), transparent)" }} />
        </div>
        <ParticleField />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-between w-full">
          {/* Left */}
          <div className="flex w-full flex-col gap-5 md:w-1/2 items-center md:items-start text-center md:text-left md:pt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full w-fit animate-fade-up"
              style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)", animationDelay: "0s" }}>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {/* Tampilkan badge utuh jika isMobile, jika tidak jalankan teks ketik (beserta caret-nya) */}
              <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase text-amber-500" aria-label={badgeText}>
                {isMobile ? badgeText : typedBadgeText}
                {!isMobile && <span className="type-caret" aria-hidden="true">|</span>}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-tight animate-fade-up text-white"
              style={{ fontFamily: "'Syne', sans-serif", animationDelay: "0.1s" }}>
              Master Your<br />
              <span className="gold-shimmer">Finances</span><br />
              Smarter.
            </h1>
            <p className="text-base sm:text-[1.05rem] leading-relaxed max-w-md animate-fade-up text-gray-300"
              style={{ animationDelay: "0.2s" }}>
              SAWIT helps you track spending, plan savings, and make smarter money decisions
              with AI-powered insights built for personal finance.
            </p>
            <div className="flex w-full flex-col flex-wrap gap-3 sm:w-auto sm:flex-row justify-center md:justify-start animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={() => navigate("/auth?mode=register")}
                className="group w-full sm:w-auto px-7 py-3 rounded-full font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 text-yellow-950"
                style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", boxShadow: "0 8px 32px rgba(245,166,35,0.45)" }}>
                Get Started Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/auth?mode=login")}
                className="w-full sm:w-auto px-7 py-3 rounded-full font-semibold text-base transition-all duration-200 hover:bg-white/10 text-gray-300 border border-gray-600">
                View Demo
              </button>
            </div>
            <div className="animate-fade-up text-sm max-w-md text-gray-400" style={{ animationDelay: "0.4s" }}>
              Track transactions, budgets, subscriptions, and financial goals in one place.
            </div>
          </div>
          {/* Right */}
          <div className="hidden md:flex items-center justify-center md:w-1/2 md:justify-end animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <HeroCharacter />
          </div>
        </div>
        {!isMobile ? (
          <button 
            onClick={() => scrollToSection('about')}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group cursor-pointer transition-all duration-300 hover:opacity-100"
            style={{ opacity: 0.6 }}
            aria-label="Scroll to about section"
          >
            <span className="text-xs tracking-widest uppercase text-gray-300 group-hover:text-amber-400 transition-colors duration-300">Scroll</span>
            <div className="flex flex-col items-center gap-1 group-hover:translate-y-1 transition-transform duration-300">
              <div className="w-px h-6 bg-linear-to-b from-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-px h-8 bg-linear-to-b from-white/40 to-transparent animate-bounce" style={{ animationDuration: '2s' }} />
              <div className="w-0.5 h-1 rounded-full bg-white/40 animate-pulse" />
            </div>
          </button>
        ) : null}
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
            <FeatureCard icon={AnimatedAiLogo} title="AI Insights" desc="Get guidance based on patterns from your personal financial activity." accent="#22c55e" />
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
            <FeatureCard icon={AnimatedAiLogo} title="AI Recommendations" desc="Practical suggestions based on transaction and budget trends." accent="#F5A623" />
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
              style={{ background: "rgba(34, 197, 94, 0.12)", color: "#25D366" }}
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
              style={{ background: "rgba(225, 48, 108, 0.12)", color: "#E1306C" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(225, 48, 108, 0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(225, 48, 108, 0.1)"}
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