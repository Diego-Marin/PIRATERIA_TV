import { useCallback, useEffect, useRef, useState } from 'react';

const HIDE_DELAY = 3000;
const SPEEDS = [1, 1.25, 1.5, 2, 0.75];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
    <path d={d} />
  </svg>
);

const PLAY = 'M8 5v14l11-7z';
const PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z';
const CAPTIONS =
  'M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1z';
const FULLSCREEN ='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z';

// Reproductor propio para videos con URL directa (por ejemplo Cloudflare R2).
export default function NativePlayer({ src, title, subtitleUrl }) {
  const videoRef = useRef(null);
  const hideTimer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(true);
  // Si el bucket no tiene CORS, el video falla al pedirlo con subtítulos:
  // en ese caso se reintenta sin ellos para que al menos se reproduzca.
  const [corsFailed, setCorsFailed] = useState(false);
  const hasSubtitles = Boolean(subtitleUrl) && !corsFailed;
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, HIDE_DELAY);
  }, []);

  const reveal = useCallback(() => {
    setShowControls(true);
    scheduleHide();
  }, [scheduleHide]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const seekBy = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0);
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Subtítulos: muestra u oculta la pista según el botón CC
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasSubtitles) return undefined;

    const apply = () => {
      Array.from(video.textTracks).forEach((track) => {
        track.mode = captionsOn ? 'showing' : 'hidden';
      });
    };
    apply();
    video.textTracks.addEventListener('addtrack', apply);
    return () => video.textTracks.removeEventListener('addtrack', apply);
  }, [hasSubtitles, captionsOn]);

  // Teclado: espacio = play/pausa, flechas = ±10 s
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
      } else if (event.key === 'ArrowRight') seekBy(10);
      else if (event.key === 'ArrowLeft') seekBy(-10);
      else return;
      reveal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlay, seekBy, reveal]);

  const handleSurfaceClick = (event) => {
    if (event.target.closest('.native-player__controls > *')) return;
    if (!isPlaying) {
      togglePlay();
      return;
    }
    if (showControls) {
      clearTimeout(hideTimer.current);
      setShowControls(false);
    } else {
      reveal();
    }
  };

  const updateBuffered = () => {
    const video = videoRef.current;
    if (!video || video.buffered.length === 0) return;
    setBuffered(video.buffered.end(video.buffered.length - 1));
  };

  const handleSeek = (event) => {
    const video = videoRef.current;
    const value = Number(event.target.value);
    if (video) video.currentTime = value;
    setCurrent(value);
    reveal();
  };

  const cycleSpeed = () => {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (videoRef.current) videoRef.current.playbackRate = SPEEDS[next];
    reveal();
  };

  const enterFullscreen = () => {
    const container = videoRef.current?.closest('.player-modal');
    if (container?.requestFullscreen) container.requestFullscreen().catch(() => {});
    else videoRef.current?.webkitEnterFullscreen?.(); // iPhone
  };

  const progress = duration ? (current / duration) * 100 : 0;
  const bufferedPct = duration ? Math.max((buffered / duration) * 100, progress) : 0;
  const controlsVisible = showControls || !isPlaying;

  return (
    <div className="native-player" onMouseMove={reveal} onClick={handleSurfaceClick}>
      <video
        key={corsFailed ? 'plain' : 'cors'}
        ref={videoRef}
        className="native-player__video"
        src={src}
        title={title}
        autoPlay
        playsInline
        preload="auto"
        crossOrigin={hasSubtitles ? 'anonymous' : undefined}
        onPlay={() => {
          setIsPlaying(true);
          scheduleHide();
        }}
        onPause={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
        onEnded={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => {
          setCurrent(event.currentTarget.currentTime);
          updateBuffered();
        }}
        onProgress={updateBuffered}
        onError={() => {
          if (hasSubtitles) {
            setCorsFailed(true);
            setIsBuffering(true);
            return;
          }
          setHasError(true);
          setIsBuffering(false);
        }}
      >
        {hasSubtitles && (
          <track kind="subtitles" src={subtitleUrl} srcLang="es" label="Subtítulos" default />
        )}
      </video>

      {isBuffering && !hasError && <div className="native-player__spinner" aria-hidden="true" />}
      {hasError && (
        <div className="native-player__error">No se pudo reproducir este video.</div>
      )}

      {!hasError && (
        <div className={`native-player__controls${controlsVisible ? '' : ' is-hidden'}`}>
          {!isPlaying && !isBuffering && (
            <button
              type="button"
              className="native-player__center"
              onClick={togglePlay}
              aria-label="Reproducir"
            >
              <Icon d={PLAY} />
            </button>
          )}

          <div className="native-player__bar">
            <button
              type="button"
              className="np-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              <Icon d={isPlaying ? PAUSE : PLAY} />
            </button>
            <button type="button" className="np-btn np-btn--text" onClick={() => seekBy(-10)}>
              −10
            </button>
            <button type="button" className="np-btn np-btn--text" onClick={() => seekBy(10)}>
              +10
            </button>

            <span className="native-player__time">{formatTime(current)}</span>
            <input
              className="native-player__seek"
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={current}
              onChange={handleSeek}
              style={{ '--p': `${progress}%`, '--b': `${bufferedPct}%` }}
              aria-label="Posición del video"
            />
            <span className="native-player__time">{formatTime(duration)}</span>

            <button type="button" className="np-btn np-btn--text" onClick={cycleSpeed}>
              {SPEEDS[speedIndex]}x
            </button>
            {hasSubtitles && (
              <button
                type="button"
                className={`np-btn${captionsOn ? ' np-btn--on' : ''}`}
                onClick={() => {
                  setCaptionsOn((value) => !value);
                  reveal();
                }}
                aria-label="Subtítulos"
                aria-pressed={captionsOn}
              >
                <Icon d={CAPTIONS} />
              </button>
            )}
            {!isFullscreen && (
              <button
                type="button"
                className="np-btn"
                onClick={enterFullscreen}
                aria-label="Pantalla completa"
              >
                <Icon d={FULLSCREEN} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}