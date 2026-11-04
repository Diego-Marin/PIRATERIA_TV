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
    // Con Drive no: su iframe tiene su propia pantalla completa y al salir
    // de ella el navegador puede disparar este evento y cerrar todo.
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && movie.videoUrl) onClose();
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
      <VideoPlayer
        driveFileId={movie.driveFileId}
        videoUrl={movie.videoUrl}
        subtitleUrl={movie.subtitleUrl}
        title={movie.title}
        onClose={onClose}
      />
    </div>
  );
}