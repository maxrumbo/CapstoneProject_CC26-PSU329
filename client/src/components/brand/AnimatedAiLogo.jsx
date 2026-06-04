export default function AnimatedAiLogo({ size = 40 }) {
  return (
    <div style={{ width: size, height: size, display: "inline-block" }}>
      <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        <style>{`
          .ai-core { fill: url(#g1); filter: drop-shadow(0 6px 18px rgba(124,58,237,0.18)); }
          .ai-ring { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 2; }
          .ai-dot { fill: #fff; opacity: 0.9; }
          @keyframes pulseCore { 0% { transform: scale(0.95); opacity:0.9 } 50% { transform: scale(1.06); opacity:1 } 100% { transform: scale(0.95); opacity:0.9 } }
          @keyframes orbit { 0% { transform: rotate(0deg) translateX(18px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(18px) rotate(-360deg); } }
          .ai-core { transform-origin: 50% 50%; animation: pulseCore 2.4s ease-in-out infinite; }
          .orbit-group { transform-origin: 50% 50%; animation: orbit 4s linear infinite; }
        `}</style>

        <g transform="translate(6,6)">
          <circle className="ai-ring" cx="26" cy="26" r="24" />

          <g className="orbit-group">
            <circle className="ai-dot" cx="44" cy="26" r="2.8" />
          </g>

          <g>
            <circle className="ai-core" cx="26" cy="26" r="12" />
            <path d="M20 22c2-2 6-2 8 0" stroke="#ffffff80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <circle cx="22" cy="30" r="1.8" fill="#ffffff80" />
          </g>
        </g>
      </svg>
    </div>
  );
}
