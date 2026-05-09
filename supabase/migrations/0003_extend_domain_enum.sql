-- =============================================================================
-- 0003_extend_domain_enum.sql
-- Extiende domain_enum con 4 nuevos dominios:
--   spending_profile  (meta — sensibilidad al precio y mentalidad de gasto)
--   fashion_taste     (vertical — estilo personal)
--   food_taste        (vertical — paladar y hábitos gastronómicos)
--   travel_style      (vertical — vibe viajero y patrones de viaje)
--
-- Nota: alter type ... add value no puede ejecutarse dentro de una transacción
-- junto con otras DDL que dependan del nuevo valor. Por eso esta migración
-- contiene solo los add value, sin más cambios.
-- También extendemos el check de session_index a 0..11 para acomodar los nuevos
-- slots del curriculum (12 slots: 8 dominios broad + 2 deep + synthesis + gap).
-- =============================================================================

alter type domain_enum add value if not exists 'spending_profile';
alter type domain_enum add value if not exists 'fashion_taste';
alter type domain_enum add value if not exists 'food_taste';
alter type domain_enum add value if not exists 'travel_style';

alter table public.sessions
  drop constraint if exists sessions_session_index_check;

alter table public.sessions
  add constraint sessions_session_index_check
  check (session_index between 0 and 11);
