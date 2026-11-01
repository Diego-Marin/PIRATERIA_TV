import { useState } from 'react';

export default function MovieCard({ movie, onSelect }) {
  const { title, year, category, coverUrl } = movie;
  const [hasImageError, setHasImageError] = useState(false);
  const meta = [year, category].filter(Boolean).join(' · ');
  const showCover = coverUrl && !hasImageError;

  return (
    <button
      className="movie-card"
      type="button"
      onClick={() => onSelect(movie)}
      aria-label={`Reproducir ${title}`}
    >
      <div className="movie-card__poster">
        {showCover ? (
          <img
            src={coverUrl}
            alt={`Portada de ${title}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <span className="movie-card__fallback">{title}</span>
        )}
        <span className="movie-card__play" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <h3 className="movie-card__title">{title}</h3>
      {meta && <p className="movie-card__meta">{meta}</p>}
    </button>
  );
}