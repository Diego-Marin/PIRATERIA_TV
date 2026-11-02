const getEmbedUrl = (driveFileId) =>
  `https://drive.google.com/file/d/${driveFileId}/preview`;

// Drive ya muestra su propio indicador de carga dentro del iframe,
// por eso aquí no se dibuja otro (evita el loader doble).
export default function VideoPlayer({ driveFileId, title }) {
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
