import { useEffect, useMemo, useState } from 'react';
import Loader from '../ui/Loader.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import useEpisodes from '../../hooks/useEpisodes.js';

// `active` es false mientras el reproductor está abierto encima,
// para que Escape solo cierre el reproductor.
export default function SeriesModal({ series, active = true, onSelectEpisode, onClose }) {
  const { episodes, isLoading, error } = useEpisodes(series.id);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const isCourse = series.type === 'course';

  const seasons = useMemo(
    () => [...new Set(episodes.map((ep) => ep.season))].sort((a, b) => a - b),
    [episodes]
  );
  const currentSeason = selectedSeason ?? seasons[0];
  const seasonEpisodes = episodes.filter((ep) => ep.season === currentSeason);

  useEffect(() => {
    if (!active) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const meta = [series.year, series.category].filter(Boolean).join(' · ');

  const renderBody = () => {
    if (isLoading) return <Loader label="Cargando capítulos…" />;
    if (error) return <EmptyState title="No se pudieron cargar los capítulos" message={error} />;
    if (episodes.length === 0) {
      return (
        <EmptyState
          title={isCourse ? 'Aún no hay clases' : 'Aún no hay capítulos'}
          message="Agrega filas a la tabla episodes en Supabase."
        />
      );
    }

    return (
      <>
        <div className="series-modal__seasons" role="tablist" aria-label="Temporadas">
          {seasons.map((season) => (
            <button
              key={season}
              type="button"
              role="tab"
              aria-selected={season === currentSeason}
              className={`season-tab${season === currentSeason ? ' season-tab--active' : ''}`}
              onClick={() => setSelectedSeason(season)}
            >
              {isCourse ? 'Módulo' : 'Temporada'} {season}
            </button>
          ))}
        </div>

        <ul className="episode-list">
          {seasonEpisodes.map((ep) => (
            <li key={ep.id}>
              <button
                type="button"
                className="episode-item"
                onClick={() => onSelectEpisode(series, ep)}
              >
                <span className="episode-item__num">{ep.episode}</span>
                <span className="episode-item__title">
                  {ep.title || `${isCourse ? 'Clase' : 'Capítulo'} ${ep.episode}`}
                </span>
                <svg className="episode-item__play" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div
      className="series-modal"
      role="dialog"
      aria-modal="true"
      aria-label={series.title}
      onClick={handleBackdropClick}
    >
      <div className="series-modal__panel">
        <header className="series-modal__header">
          <div>
            <h2 className="series-modal__title">{series.title}</h2>
            {meta && <p className="series-modal__meta">{meta}</p>}
          </div>
          <button
            className="series-modal__close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>
        {series.description && <p className="series-modal__description">{series.description}</p>}
        {renderBody()}
      </div>
    </div>
  );
}
