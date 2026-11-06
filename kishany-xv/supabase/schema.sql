-- =========================================================
-- Base de datos de la invitación (Supabase / PostgreSQL)
-- Ejecútalo una vez en Supabase → SQL Editor → New query → Run
-- =========================================================

-- Confirmaciones de asistencia
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text not null unique,          -- nombre normalizado: evita respuestas duplicadas
  attending boolean not null,
  companions int not null default 0,
  companion_names text default '',
  phone text default '',
  diet text default '',
  message text default '',
  ip_hash text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Canciones sugeridas por los invitados
create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  song text not null,
  song_key text not null unique,          -- evita canciones repetidas; suma votos
  link text default '',
  guest_name text default '',
  votes int not null default 1,
  ip_hash text default '',
  created_at timestamptz not null default now()
);

create index if not exists rsvps_updated_idx on public.rsvps (updated_at desc);
create index if not exists songs_votes_idx on public.songs (votes desc, created_at desc);

-- Seguridad: nadie entra con la clave pública. Las funciones de Vercel
-- usan la clave de servicio, que omite estas políticas.
alter table public.rsvps enable row level security;
alter table public.songs enable row level security;

-- Resumen rápido para los organizadores
create or replace view public.rsvp_resumen as
select
  count(*) filter (where attending) as confirmados,
  coalesce(sum(companions) filter (where attending), 0) as acompanantes,
  count(*) filter (where attending) + coalesce(sum(companions) filter (where attending), 0) as total_personas,
  count(*) filter (where not attending) as no_asisten,
  count(*) as respuestas
from public.rsvps;
