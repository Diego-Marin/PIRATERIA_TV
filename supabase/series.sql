-- ============================================================
-- SERIES: temporadas y capítulos
-- Ejecutar una vez en Supabase → SQL Editor
-- ============================================================

-- 1) movies ahora distingue película / serie
alter table public.movies
  add column if not exists type text not null default 'movie'
  check (type in ('movie', 'series'));

-- Las series no tienen video propio (los videos están en episodes)
alter table public.movies alter column drive_file_id drop not null;

-- 2) Capítulos
create table if not exists public.episodes (
  id            uuid primary key default gen_random_uuid(),
  series_id     uuid not null references public.movies(id) on delete cascade,
  season        int  not null check (season >= 1),
  episode       int  not null check (episode >= 1),
  title         text,
  drive_file_id text not null,
  created_at    timestamptz not null default now(),
  unique (series_id, season, episode)
);

create index if not exists episodes_series_idx
  on public.episodes (series_id, season, episode);

-- 3) RLS: lectura para la app; las escrituras se hacen desde el SQL Editor
alter table public.episodes enable row level security;

drop policy if exists "episodes_read" on public.episodes;
create policy "episodes_read"
  on public.episodes for select
  to anon, authenticated
  using (true);

-- 4) Helper: acepta un enlace de Drive o un ID y devuelve solo el ID
create or replace function public.drive_id(link text)
returns text language sql immutable as $$
  select coalesce(
    substring(link from '/d/([A-Za-z0-9_-]+)'),
    substring(link from '[?&]id=([A-Za-z0-9_-]+)'),
    trim(link)
  );
$$;

-- 5) Helper: agrega un capítulo buscando la serie por título
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
  where type = 'series' and lower(title) = lower(series_title)
  limit 1;

  if sid is null then
    raise exception 'No existe la serie "%". Créala primero (ver ejemplo abajo).', series_title;
  end if;

  insert into public.episodes (series_id, season, episode, title, drive_file_id)
  values (sid, p_season, p_episode, p_title, public.drive_id(drive_link))
  on conflict (series_id, season, episode)
  do update set title = excluded.title, drive_file_id = excluded.drive_file_id;
end;
$$;

-- ============================================================
-- EJEMPLO DE USO
-- ============================================================

-- A) Crear la serie (una sola vez; sin enlace de video)
-- insert into public.movies (title, description, category, year, cover_url, type)
-- values ('Mi Serie', 'Descripción', 'Drama', 2024, 'https://...', 'series');

-- B) Agregar capítulos (pega el enlace de Drive completo)
-- select public.add_episode('Mi Serie', 1, 1, 'Piloto',   'https://drive.google.com/file/d/ID_1/view?usp=sharing');
-- select public.add_episode('Mi Serie', 1, 2, 'Segundo',  'https://drive.google.com/file/d/ID_2/view?usp=sharing');
-- select public.add_episode('Mi Serie', 2, 1, 'Regreso',  'https://drive.google.com/file/d/ID_3/view?usp=sharing');

-- C) Varios de una vez
-- select public.add_episode('Mi Serie', s, e, t, l)
-- from (values
--   (1, 3, 'Tercero', 'https://drive.google.com/file/d/ID_4/view'),
--   (1, 4, 'Cuarto',  'https://drive.google.com/file/d/ID_5/view')
-- ) as v(s, e, t, l);
