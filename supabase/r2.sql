-- ============================================================
-- DOS FUENTES DE VIDEO: Google Drive (drive_file_id) y R2 (video_url)
-- Ejecutar una vez en Supabase → SQL Editor
-- Lo que ya tienes en Drive sigue funcionando sin tocar nada.
-- ============================================================

-- 1) Nueva columna con la URL directa del video (R2)
alter table public.movies   add column if not exists video_url text;
alter table public.episodes add column if not exists video_url text;

-- 2) Los capítulos ya no exigen Drive; basta con una de las dos fuentes
alter table public.episodes alter column drive_file_id drop not null;
alter table public.episodes drop constraint if exists episodes_source_check;
alter table public.episodes
  add constraint episodes_source_check
  check (drive_file_id is not null or video_url is not null);

-- 3) add_episode: detecta solo si el enlace es de Drive o una URL directa
create or replace function public.add_episode(
  series_title text,
  p_season int,
  p_episode int,
  p_title text,
  link text
) returns void language plpgsql as $$
declare
  sid uuid;
  is_url boolean := link ~* '^https?://' and link !~* 'drive\.google\.com';
begin
  select id into sid
  from public.movies
  where type in ('series', 'course') and lower(title) = lower(series_title)
  limit 1;

  if sid is null then
    raise exception 'No existe la serie o curso "%". Créalo primero.', series_title;
  end if;

  insert into public.episodes (series_id, season, episode, title, drive_file_id, video_url)
  values (
    sid, p_season, p_episode, p_title,
    case when is_url then null else public.drive_id(link) end,
    case when is_url then trim(link) else null end
  )
  on conflict (series_id, season, episode)
  do update set
    title         = excluded.title,
    drive_file_id = excluded.drive_file_id,
    video_url     = excluded.video_url;
end;
$$;

-- ============================================================
-- EJEMPLOS
-- ============================================================

-- Película nueva en R2 (sin drive_file_id)
-- insert into public.movies (title, description, category, year, cover_url, video_url, type)
-- values ('Mi Película', 'Descripción', 'Acción', 2024, 'https://...',
--         'https://TU-DOMINIO/peliculas/mi-pelicula.mp4', 'movie');

-- Pasar una película que ya existe de Drive a R2
-- update public.movies
-- set video_url = 'https://TU-DOMINIO/peliculas/mi-pelicula.mp4'
-- where title = 'Mi Película';

-- Volver a Drive: dejar video_url vacío
-- update public.movies set video_url = null where title = 'Mi Película';

-- Capítulos: el mismo add_episode acepta enlace de Drive O URL de R2
-- select public.add_episode('Mi Serie', 1, 1, 'Piloto',  'https://drive.google.com/file/d/ID_1/view');
-- select public.add_episode('Mi Serie', 1, 2, 'Segundo', 'https://TU-DOMINIO/series/mi-serie/s01e02.mp4');
