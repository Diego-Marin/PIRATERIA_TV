-- ============================================================
-- CURSOS: tercera categoría (se comporta como una serie:
-- temporada = módulo, capítulo = clase)
-- Ejecutar una vez en Supabase → SQL Editor
-- ============================================================

-- 1) Permitir type = 'course'
alter table public.movies drop constraint if exists movies_type_check;
alter table public.movies
  add constraint movies_type_check check (type in ('movie', 'series', 'course'));

-- 2) add_episode ahora acepta series y cursos
create or replace function public.add_episode(
  series_title text,
  p_season int,
  p_episode int,
  p_title text,
  drive_link text
) returns void language plpgsql as $$
declare
  sid uuid;
begin
  select id into sid
  from public.movies
  where type in ('series', 'course') and lower(title) = lower(series_title)
  limit 1;

  if sid is null then
    raise exception 'No existe la serie o curso "%". Créalo primero.', series_title;
  end if;

  insert into public.episodes (series_id, season, episode, title, drive_file_id)
  values (sid, p_season, p_episode, p_title, public.drive_id(drive_link))
  on conflict (series_id, season, episode)
  do update set title = excluded.title, drive_file_id = excluded.drive_file_id;
end;
$$;

-- ============================================================
-- EJEMPLO
-- ============================================================

-- Crear el curso (una sola vez)
-- insert into public.movies (title, description, category, year, cover_url, type)
-- values ('Mi Curso', 'Descripción', 'Programación', 2025, 'https://...', 'course');

-- Agregar clases (temporada = módulo, capítulo = clase)
-- select public.add_episode('Mi Curso', 1, 1, 'Introducción', 'https://drive.google.com/file/d/ID_1/view');
-- select public.add_episode('Mi Curso', 1, 2, 'Instalación',  'https://drive.google.com/file/d/ID_2/view');
-- select public.add_episode('Mi Curso', 2, 1, 'Primer módulo avanzado', 'https://drive.google.com/file/d/ID_3/view');
