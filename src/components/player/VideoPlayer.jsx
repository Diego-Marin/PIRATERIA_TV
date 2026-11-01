import { useState } from 'react';
import Loader from '../ui/Loader.jsx';

const getEmbedUrl = (driveFileId) =>
  `https://drive.google.com/file/d/${driveFileId}/preview`;

const getDriveUrl = (driveFileId) =>
  `https://drive.google.com/file/d/${driveFileId}/view`;

export default function VideoPlayer({ driveFileId, title }) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!driveFileId) {
    return (
      <div className="video-player video-player--message">
        <p>Esta película todavía no tiene un video asociado.</p>
      </div>
    );
  }

  return (
    <div className="video-player">
      {!isLoaded && (
        <div className="video-player__loading">
          <Loader label="Cargando video…" />
        </div>
      )}
      <iframe
        className="video-player__frame"
        src={getEmbedUrl(driveFileId)}
        title={title}
        allow="autoplay; fullscreen"
        allowFullScreen
        onLoad={() => setIsLoaded(true)}
      />
      <p className="video-player__help">
        ¿No se reproduce? Puede estar procesándose en Drive o sin permiso público.{' '}
        <a href={getDriveUrl(driveFileId)} target="_blank" rel="noreferrer">
          Abrir en Drive
        </a>
      </p>
    </div>
  );
}
