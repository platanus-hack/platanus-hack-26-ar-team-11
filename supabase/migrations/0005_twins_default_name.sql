-- =============================================================================
-- 0005_twins_default_name.sql
-- Unifica twins.name al formato "Twin de <nombre>". Backfillea filas
-- existentes con name null y actualiza handle_new_user para que los signups
-- nuevos arranquen con el mismo formato.
-- =============================================================================

update public.twins t
set name = 'Twin de ' || coalesce(
  nullif(au.raw_user_meta_data->>'name', ''),
  split_part(au.email, '@', 1)
)
from auth.users au
where t.user_id = au.id
  and t.name is null;

create or replace function public.handle_new_user()
returns trigger as $$
declare
  display_name text;
begin
  display_name := coalesce(
    nullif(new.raw_user_meta_data->>'name', ''),
    split_part(new.email, '@', 1)
  );

  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.twins (user_id, name, completion_score, next_session_index)
  values (new.id, 'Twin de ' || display_name, 0, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;
