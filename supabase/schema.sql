-- MI STREAMING — esquema inicial de Supabase
-- Ejecuta TODO este archivo en Supabase > SQL Editor > New query.
-- Usa la clave publicable en el frontend; NUNCA pongas service_role/secret en el navegador.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  category text not null default 'Sin categoría',
  release_year integer check (release_year is null or release_year between 1888 and 2100),
  poster_url text,
  drive_file_id text not null unique,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Crea automáticamente un perfil básico al registrarse un usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Comprueba el rol desde la base de datos. SECURITY DEFINER evita recursión de RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.is_admin = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.movies enable row level security;

-- Cada usuario autenticado solo puede leer su propio perfil.
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

-- El catálogo solo se consulta con sesión iniciada.
drop policy if exists "Authenticated users can read movies" on public.movies;
create policy "Authenticated users can read movies"
on public.movies for select
to authenticated
using (true);

-- Solo administradores pueden agregar, modificar o quitar títulos.
drop policy if exists "Admins can insert movies" on public.movies;
create policy "Admins can insert movies"
on public.movies for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists "Admins can update movies" on public.movies;
create policy "Admins can update movies"
on public.movies for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete movies" on public.movies;
create policy "Admins can delete movies"
on public.movies for delete
to authenticated
using ((select public.is_admin()));

-- Permisos mínimos para que supabase-js use las tablas con RLS.
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.movies to authenticated;

-- Después de crear tu cuenta, reemplaza el correo y ejecuta este UPDATE
-- para convertir TU perfil en administrador. No lo habilites desde el frontend.
-- update public.profiles
-- set is_admin = true
-- where id = (select id from auth.users where email = 'TU_CORREO@EJEMPLO.COM');
