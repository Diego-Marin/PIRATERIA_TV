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

  // Cierra al tocar el fondo negro, no al interactuar con el video.
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="player-modal"
      role="dialog"
      aria-modal="true"
      aria-label={movie.title}
      onClick={handleBackdropClick}
    >
      <button
        className="player-modal__close"
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
      >
        ✕
      </button>
      <VideoPlayer driveFileId={movie.driveFileId} title={movie.title} />
    </div>
  );
}