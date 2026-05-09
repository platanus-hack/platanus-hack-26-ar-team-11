-- =============================================================================
-- Twin Protocol — initial schema
-- Source of truth: CONTRACTS.md §DB_SCHEMA
-- =============================================================================


-- =============================================================================
-- ENUM TYPES
-- =============================================================================

create type domain_enum as enum (
  'music_taste',
  'event_preferences',
  'vibes',
  'communication_style'
);

create type session_type_enum as enum (
  'training',
  'chat'
);

create type edit_action_enum as enum (
  'add',
  'remove',
  'edit'
);

create type connection_status_enum as enum (
  'active',
  'revoked',
  'expired'
);


-- =============================================================================
-- USERS — espejo público de auth.users (para FKs y datos de perfil).
-- =============================================================================

create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- =============================================================================
-- TWINS — entidad principal del MVP. 1 twin por user.
-- =============================================================================

create table public.twins (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references public.users(id) on delete cascade,
  name                text,
  completion_score    numeric(3,2) not null default 0 check (completion_score between 0 and 1),
  summary             text,
  profile_json        jsonb not null default
                        '{"version":1,"summary":null,"summary_generated_at":null,"summary_after_session_id":null}'::jsonb,
  next_session_index  smallint not null default 0 check (next_session_index between 0 and 8),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);


-- =============================================================================
-- TWIN_SKILLS — un row por dominio. Source of truth del conocimiento del Twin.
-- =============================================================================

create table public.twin_skills (
  id          uuid primary key default gen_random_uuid(),
  twin_id     uuid not null references public.twins(id) on delete cascade,
  domain      domain_enum not null,
  confidence  numeric(3,2) not null default 0 check (confidence between 0 and 1),
  facts_json  jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (twin_id, domain)
);


-- =============================================================================
-- SESSIONS — sesiones de entrenamiento (curriculum) o chat libre.
-- =============================================================================

create table public.sessions (
  id                    uuid primary key default gen_random_uuid(),
  twin_id               uuid not null references public.twins(id) on delete cascade,
  type                  session_type_enum not null,
  domain                domain_enum,
  transcript_json       jsonb not null default '[]'::jsonb,
  summary               text,
  extracted_facts_json  jsonb not null default '[]'::jsonb,
  session_index         smallint check (session_index between 0 and 7),
  target_domains_json   jsonb not null default '[]'::jsonb,
  duration_seconds      integer,
  started_at            timestamptz not null default now(),
  ended_at              timestamptz,
  created_at            timestamptz not null default now()
);

create index idx_sessions_twin_created
  on public.sessions (twin_id, created_at desc);


-- =============================================================================
-- TWIN_SKILL_EDITS — audit trail de correcciones manuales del usuario.
-- =============================================================================

create table public.twin_skill_edits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  twin_id      uuid not null references public.twins(id) on delete cascade,
  domain       domain_enum not null,
  action       edit_action_enum not null,
  fact_before  jsonb,
  fact_after   jsonb,
  reason       text,
  created_at   timestamptz not null default now()
);


-- =============================================================================
-- DEVELOPER_APPS — third parties registrados (seedeados, no UI todavía).
-- =============================================================================

create table public.developer_apps (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  description          text,
  client_id            text not null unique,
  client_secret_hash   text not null,
  redirect_uris_json   jsonb not null default '[]'::jsonb,
  allowed_scopes_json  jsonb not null default '[]'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);


-- =============================================================================
-- APP_CONNECTIONS — conexión user/twin ↔ app, con token hash.
-- =============================================================================

create table public.app_connections (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  twin_id             uuid not null references public.twins(id) on delete cascade,
  app_id              uuid not null references public.developer_apps(id) on delete cascade,
  scopes_json         jsonb not null default '[]'::jsonb,
  status              connection_status_enum not null default 'active',
  access_token_hash   text not null,
  created_at          timestamptz not null default now(),
  revoked_at          timestamptz
);

create index idx_app_connections_user_app
  on public.app_connections (user_id, app_id);

create index idx_app_connections_status
  on public.app_connections (status) where status = 'active';


-- =============================================================================
-- QUERY_LOGS — log de cada call a /api/twin/query (allowed y blocked).
-- =============================================================================

create table public.query_logs (
  id                 uuid primary key default gen_random_uuid(),
  connection_id      uuid references public.app_connections(id) on delete set null,
  user_id            uuid references public.users(id) on delete set null,
  twin_id            uuid references public.twins(id) on delete set null,
  app_id             uuid references public.developer_apps(id) on delete set null,
  intent             text not null,
  question           text,
  response_summary   text,
  allowed            boolean not null,
  blocked_reason     text,
  scopes_used_json   jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now()
);

create index idx_query_logs_conn_created
  on public.query_logs (connection_id, created_at desc);

create index idx_query_logs_user_created
  on public.query_logs (user_id, created_at desc);


-- =============================================================================
-- TRIGGERS — auto-update de updated_at.
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at         before update on public.users          for each row execute function public.set_updated_at();
create trigger trg_twins_updated_at         before update on public.twins          for each row execute function public.set_updated_at();
create trigger trg_twin_skills_updated_at   before update on public.twin_skills    for each row execute function public.set_updated_at();
create trigger trg_developer_apps_updated   before update on public.developer_apps for each row execute function public.set_updated_at();


-- =============================================================================
-- TRIGGER auto-create public.users + twins al hacer signup en auth.users.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.twins (user_id, completion_score, next_session_index)
  values (new.id, 0, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
