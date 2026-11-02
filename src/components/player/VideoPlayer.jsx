import NativePlayer from './NativePlayer.jsx';

const getEmbedUrl = (driveFileId) =>
  `https://drive.google.com/file/d/${driveFileId}/preview`;

// Dos fuentes de video:
//  - videoUrl     → URL directa (Cloudflare R2): reproductor propio.
//  - driveFileId  → Google Drive: iframe de Drive (su loader y controles).
// Si hay las dos, gana videoUrl.
export default function VideoPlayer({ driveFileId, videoUrl, subtitleUrl, title }) {
  if (videoUrl) {
    return (
      <div className="video-player">
        <NativePlayer key={videoUrl} src={videoUrl} subtitleUrl={subtitleUrl} title={title} />
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

  return (
    <div className="video-player">
      <iframe
        className="video-player__frame"
        src={getEmbedUrl(driveFileId)}
        title={title}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
