-- =============================================================================
-- Twin Protocol — Row Level Security policies
-- Source of truth: CONTRACTS.md §DB_SCHEMA (RLS section)
-- =============================================================================
-- Notas:
-- - service_role bypassea RLS automáticamente (worker, seed, etc).
-- - El usuario autenticado solo puede ver/modificar su propia data.
-- - query_logs y twin_skill_edits no tienen INSERT policy: solo backend escribe.
-- =============================================================================


-- Enable RLS on all tables
alter table public.users             enable row level security;
alter table public.twins             enable row level security;
alter table public.twin_skills       enable row level security;
alter table public.sessions          enable row level security;
alter table public.twin_skill_edits  enable row level security;
alter table public.developer_apps    enable row level security;
alter table public.app_connections   enable row level security;
alter table public.query_logs        enable row level security;


-- =============================================================================
-- USERS
-- =============================================================================

create policy users_select_own
  on public.users for select
  using (auth.uid() = id);

create policy users_update_own
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- =============================================================================
-- TWINS — solo el dueño.
-- =============================================================================

create policy twins_all_own
  on public.twins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- =============================================================================
-- TWIN_SKILLS — solo a través del twin del user.
-- =============================================================================

create policy twin_skills_all_own
  on public.twin_skills for all
  using (
    exists (select 1 from public.twins t where t.id = twin_skills.twin_id and t.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.twins t where t.id = twin_skills.twin_id and t.user_id = auth.uid())
  );


-- =============================================================================
-- SESSIONS — solo a través del twin del user.
-- =============================================================================

create policy sessions_all_own
  on public.sessions for all
  using (
    exists (select 1 from public.twins t where t.id = sessions.twin_id and t.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.twins t where t.id = sessions.twin_id and t.user_id = auth.uid())
  );


-- =============================================================================
-- TWIN_SKILL_EDITS — propio user lee/inserta sus correcciones.
-- =============================================================================

create policy edits_select_own
  on public.twin_skill_edits for select
  using (auth.uid() = user_id);

create policy edits_insert_own
  on public.twin_skill_edits for insert
  with check (auth.uid() = user_id);


-- =============================================================================
-- DEVELOPER_APPS — public read; mutaciones solo via service_role.
-- =============================================================================

create policy apps_select_public
  on public.developer_apps for select
  using (true);


-- =============================================================================
-- APP_CONNECTIONS — propio user lee/actualiza (revoke).
-- =============================================================================

create policy connections_select_own
  on public.app_connections for select
  using (auth.uid() = user_id);

create policy connections_update_own
  on public.app_connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- =============================================================================
-- QUERY_LOGS — propio user lee. Inserts solo por backend (service_role).
-- =============================================================================

create policy logs_select_own
  on public.query_logs for select
  using (auth.uid() = user_id);
