function BrandLogo({ className = "", variant = "mark" }) {
  return (
    <img
      className={`brand-logo brand-logo-${variant}${className ? ` ${className}` : ""}`}
      src="/logo-no-bg.png"
      alt="Logo SAWIT"
      loading="lazy"
    />
  );
}

export default BrandLogo;
