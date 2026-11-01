import Logo from '../ui/Logo.jsx';
import SearchInput from '../ui/SearchInput.jsx';

export default function Header({ onSearch }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <Logo href="#catalogo" />
        <SearchInput onSearch={onSearch} />
      </div>
    </header>
  );
}