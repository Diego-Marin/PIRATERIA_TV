import Logo from '../ui/Logo.jsx';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Logo size="sm" />
        <p className="footer__text">© {year} Pirateria TV. Tu biblioteca personal de videos.</p>
      </div>
    </footer>
  );
}