import { useEffect, useRef } from 'react';
import VideoPlayer from './VideoPlayer.jsx';

// `movie` solo necesita { title, driveFileId }.
export default function PlayerModal({ movie, onClose }) {
  const modalRef = useRef(null);

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

  // Al abrir: pantalla completa del dispositivo y orientación horizontal.
  // Funciona porque el modal se abre desde un clic del usuario.
  useEffect(() => {
    const el = modalRef.current;

    (async () => {
      try {
        if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        await screen.orientation?.lock?.('landscape');
      } catch {
        // iOS / navegadores sin soporte: queda el modal a pantalla completa de la página.
      }
    })();

    // Si el usuario sale de pantalla completa, se cierra el reproductor.
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) onClose();
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      try {
        screen.orientation?.unlock?.();
      } catch {
        // sin soporte
      }
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={modalRef}
      className="player-modal"
      role="dialog"
      aria-modal="true"
      aria-label={movie.title}
    >
      {/* Franja propia: el botón ya no se superpone a los controles de Drive */}
      <div className="player-modal__bar">
        <button
          className="player-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
        <span className="player-modal__title">{movie.title}</span>
      </div>
      <VideoPlayer driveFileId={movie.driveFileId} title={movie.title} />
    </div>
  );
}
