import { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import MovieGrid from '../components/catalog/MovieGrid.jsx';
import PlayerModal from '../components/player/PlayerModal.jsx';
import useMovies from '../hooks/useMovies.js';

export default function HomePage() {
  const { movies, isLoading, error } = useMovies();
  const [selectedMovie, setSelectedMovie] = useState(null);

  const renderCatalog = () => {
    if (isLoading) return <Loader label="Cargando catálogo…" />;
    if (error) {
      return <EmptyState title="No se pudo cargar el catálogo" message={error} />;
    }
    if (movies.length === 0) {
      return (
        <EmptyState
          title="Aún no hay películas"
          message="Agrega filas a la tabla movies en Supabase y aparecerán aquí."
        />
      );
    }
    return <MovieGrid movies={movies} onSelectMovie={setSelectedMovie} />;
  };

  return (
    <>
      <section id="inicio" className="hero">
        <div className="container hero__content">
          <p className="hero__eyebrow">Sin registro. Sin cuentas.</p>
          <h1 className="hero__title">Tu biblioteca personal de cine</h1>
          <p className="hero__text">
            Entra, explora el catálogo y reproduce tus videos al instante.
          </p>
          <Button href="#catalogo">Explorar catálogo</Button>
        </div>
      </section>

      <section id="catalogo" className="section">
        <div className="container">
          <h2 className="section__title">Catálogo</h2>
          <div className="section__body">{renderCatalog()}</div>
        </div>
      </section>

      {selectedMovie && (
        <PlayerModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </>
  );
}
