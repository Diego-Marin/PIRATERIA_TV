-- ============================================================
-- SUBTÍTULOS (archivo .vtt en R2) para películas y capítulos/clases
-- Ejecutar una vez en Supabase → SQL Editor
-- ============================================================

alter table public.movies   add column if not exists subtitle_url text;
alter table public.episodes add column if not exists subtitle_url text;

-- ============================================================
-- EJEMPLOS
-- ============================================================

-- Una película
-- update public.movies
-- set subtitle_url = 'https://pub-281fa33684224e438e3a6d29a4cbe3f4.r2.dev/subtitulos/mi-pelicula.vtt'
-- where title = 'Mi Película';

-- Una clase concreta (módulo 1, clase 1)
-- update public.episodes
-- set subtitle_url = 'https://pub-281fa33684224e438e3a6d29a4cbe3f4.r2.dev/Básico%20de%20Escritura%20en%20Inglés/1%20Course%20Introduction.vtt'
-- where series_id = (select id from public.movies where title = 'Mi Curso')
--   and season = 1 and episode = 1;

-- TODO UN CURSO A LA VEZ: si cada .vtt se llama igual que su video
-- (mismo nombre, extensión .vtt) y está en la misma carpeta
-- update public.episodes
-- set subtitle_url = regexp_replace(video_url, '\.(mp4|webm|mov|m4v)$', '.vtt')
-- where series_id = (select id from public.movies where title = 'Mi Curso')
--   and video_url is not null;

-- Quitar subtítulos
-- update public.movies set subtitle_url = null where title = 'Mi Película';
