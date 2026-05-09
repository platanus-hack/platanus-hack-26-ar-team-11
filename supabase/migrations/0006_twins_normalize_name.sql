-- =============================================================================
-- 0006_twins_normalize_name.sql
-- Renombra twins que no respetan el formato "Twin de <nombre>" usando la misma
-- regla del 0005 (raw_user_meta_data.name → fallback al local-part del email).
-- =============================================================================

update public.twins t
set name = 'Twin de ' || coalesce(
  nullif(au.raw_user_meta_data->>'name', ''),
  split_part(au.email, '@', 1)
)
from auth.users au
where t.user_id = au.id
  and (t.name is null or t.name not like 'Twin de %');
