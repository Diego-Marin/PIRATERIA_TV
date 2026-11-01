import { useEffect } from 'react';
import VideoPlayer from './VideoPlayer.jsx';

export default function PlayerModal({ movie, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const meta = [movie.year, movie.category].filter(Boolean).join(' · ');

  return (
    <div className="player-modal" onClick={onClose}>
      <div
        className="player-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={movie.title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="player-modal__header">
          <div>
            <h2 className="player-modal__title">{movie.title}</h2>
            {meta && <p className="player-modal__meta">{meta}</p>}
          </div>
          <button
            className="player-modal__close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <VideoPlayer driveFileId={movie.driveFileId} title={movie.title} />

        {movie.description && (
          <p className="player-modal__description">{movie.description}</p>
        )}
      </div>
    </div>
  );
}
