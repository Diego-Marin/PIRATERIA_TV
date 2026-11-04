import { useLayoutEffect, useRef, useState } from 'react';
import NativePlayer from './NativePlayer.jsx';

const getEmbedUrl = (driveFileId) =>
  `https://drive.google.com/file/d/${driveFileId}/preview`;

// Drive adapta sus controles al tamaño del iframe y se rompen por debajo de
// ~888x483. Si el contenedor es más pequeño (celular en horizontal), el iframe
// se renderiza más grande y se reduce con scale() para que Drive vea un
// tamaño "bueno" y el resultado siga llenando toda la pantalla.
const DRIVE_MIN_W = 888;
const DRIVE_MIN_H = 483;

function DriveFrame({ driveFileId, title, onClose }) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0, s: 1 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;

    const measure = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!cw || !ch) return;
      const s = Math.min(1, cw / DRIVE_MIN_W, ch / DRIVE_MIN_H);
      setSize({ w: cw / s, h: ch / s, s });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="video-player" ref={wrapRef}>
      {size.w > 0 && (
        <iframe
          className="video-player__frame"
          src={getEmbedUrl(driveFileId)}
          title={title}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{
            width: size.w,
            height: size.h,
            transform: `scale(${size.s})`,
            transformOrigin: 'top left',
          }}
        />
      )}
      {/* Cubre el botón "abrir en pestaña nueva" de Drive (arriba a la derecha),
          que sacaría al usuario de la app y rompe el reproductor. */}
      <div className="video-player__popout-shield" aria-hidden="true" />
      <button className="player-close" type="button" onClick={onClose} aria-label="Cerrar">
        ✕
      </button>
    </div>
  );
}

// Dos fuentes de video:
//  - videoUrl     → URL directa (Cloudflare R2): reproductor propio.
//  - driveFileId  → Google Drive: iframe de Drive (su loader y controles).
// Si hay las dos, gana videoUrl.
export default function VideoPlayer({ driveFileId, videoUrl, subtitleUrl, title, onClose }) {
  if (videoUrl) {
    return (
      <div className="video-player">
        <NativePlayer
          key={videoUrl}
          src={videoUrl}
          subtitleUrl={subtitleUrl}
          title={title}
          onClose={onClose}
        />
      </div>
    );
  }

  if (!driveFileId) {
    return (
      <div className="video-player video-player--message">
        <p>Este contenido todavía no tiene un video asociado.</p>
      </div>
    );
  }

  return <DriveFrame driveFileId={driveFileId} title={title} onClose={onClose} />;
}