function LogoMark() {
  return (
    <svg className="logo__mark" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3c969" />
          <stop offset="1" stopColor="#c48a21" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logo-gold)" />
      <path d="M19 14.5v19l16-9.5z" fill="#0b0d0e" />
    </svg>
  );
}

export default function Logo({ href, size = 'md' }) {
  const className = `logo logo--${size}`;
  const content = (
    <>
      <LogoMark />
      <span className="logo__text">
        <span className="logo__name">PIRATERIA</span>
        <span className="logo__tag">TV</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a className={className} href={href} aria-label="Pirateria TV">
        {content}
      </a>
    );
  }

  return (
    <span className={className} aria-label="Pirateria TV">
      {content}
    </span>
  );
}
