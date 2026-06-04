function BrandLogo({ className = "", variant = "mark" }) {
  return (
    <span className={`brand-logo brand-logo-${variant}${className ? ` ${className}` : ""}`}>
      <img className="brand-logo-image" src="/logo-no-bg.png" alt="Logo SAWIT" loading="lazy" />
    </span>
  );
}

export default BrandLogo;
