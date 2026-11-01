import SearchInput from '../ui/SearchInput.jsx';

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Catálogo', href: '#catalogo' },
];

export default function Header({ onSearch }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <a className="header__logo" href="#inicio" aria-label="Mi Streaming, inicio">
          MI STREAMING<span>.</span>
        </a>

        <nav className="header__nav" aria-label="Principal">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} className="header__link" href={href}>
              {label}
            </a>
          ))}
        </nav>

        <SearchInput onSearch={onSearch} />
      </div>
    </header>
  );
}
