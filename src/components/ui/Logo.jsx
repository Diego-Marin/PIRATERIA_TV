export default function Logo({ href, size = 'md' }) {
  const className = `logo logo--${size}`;
  const content = (
    <>
      <span className="logo__name">pirateria</span>
      <span className="logo__tag">tv</span>
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