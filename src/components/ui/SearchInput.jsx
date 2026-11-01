import { useState } from 'react';

export default function SearchInput({ placeholder = 'Buscar por título', onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(query.trim());
  };

  return (
    <form className="search-input" role="search" onSubmit={handleSubmit}>
      <svg className="search-input__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        className="search-input__field"
        type="search"
        value={query}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => setQuery(event.target.value)}
      />
    </form>
  );
}
