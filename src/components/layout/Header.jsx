import Logo from '../ui/Logo.jsx';
import SearchInput from '../ui/SearchInput.jsx';

// Cambia a true para volver a mostrar el cuadro de búsqueda.
const SHOW_SEARCH = false;

export default function Header({ onSearch }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <Logo href="#catalogo" />
        {SHOW_SEARCH && <SearchInput onSearch={onSearch} />}
      </div>
    </header>
  );
}
