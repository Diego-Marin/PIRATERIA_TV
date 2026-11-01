export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__brand">
          MI STREAMING<span>.</span>
        </span>
        <p className="footer__text">© {year} Mi Streaming. Tu biblioteca personal de videos.</p>
      </div>
    </footer>
  );
}
