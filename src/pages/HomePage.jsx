import { useState } from 'react';
import Loader from '../components/ui/Loader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import CategoryTabs, { CATEGORIES } from '../components/catalog/CategoryTabs.jsx';
import MovieGrid from '../components/catalog/MovieGrid.jsx';
import SeriesModal from '../components/catalog/SeriesModal.jsx';
import PlayerModal from '../components/player/PlayerModal.jsx';
import useMovies from '../hooks/useMovies.js';

export default function HomePage() {
  const { movies, isLoading, error } = useMovies();
  const [category, setCategory] = useState('movie');
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [playing, setPlaying] = useState(null); // { title, driveFileId }

  const handleSelectMovie = (movie) => {
    if (movie.type === 'series' || movie.type === 'course') {
      setSelectedSeries(movie);
      return;
    }
    setPlaying({ title: movie.title, driveFileId: movie.driveFileId });
  };

  const handleSelectEpisode = (series, ep) => {
    const isCourse = series.type === 'course';
    const code = `${isCourse ? 'M' : 'T'}${ep.season} ${isCourse ? 'C' : 'E'}${ep.episode}`;
    setPlaying({
      title: `${series.title} · ${code}${ep.title ? ` · ${ep.title}` : ''}`,
      driveFileId: ep.driveFileId,
    });
  };

  const renderCatalog = () => {
    if (isLoading) return <Loader label="Cargando catálogo…" />;
    if (error) {
      return <EmptyState title="No se pudo cargar el catálogo" message={error} />;
    }

    const visible = movies.filter((movie) => movie.type === category);
    if (visible.length === 0) {
      const label = CATEGORIES.find((c) => c.id === category)?.label.toLowerCase();
      return (
        <EmptyState
          title={`Aún no hay ${label}`}
          message="Agrega filas a la tabla movies en Supabase y aparecerán aquí."
        />
      );
    }
    return <MovieGrid movies={visible} onSelectMovie={handleSelectMovie} />;
  };

  return (
    <>
      <section id="catalogo" className="section">
        <div className="container">
          <CategoryTabs active={category} onChange={setCategory} />
          <div className="section__body">{renderCatalog()}</div>
        </div>
      </section>

      {selectedSeries && (
        <SeriesModal
          series={selectedSeries}
          active={!playing}
          onSelectEpisode={handleSelectEpisode}
          onClose={() => setSelectedSeries(null)}
        />
      )}

      {playing && <PlayerModal movie={playing} onClose={() => setPlaying(null)} />}
    </>
  );
}
