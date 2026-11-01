export default function Button({
  children,
  variant = 'primary',
  href,
  type = 'button',
  onClick,
  ...rest
}) {
  const className = `btn btn--${variant}`;

  if (href) {
    return (
      <a className={className} href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={className} type={type} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
