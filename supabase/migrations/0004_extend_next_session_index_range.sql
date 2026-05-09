-- =============================================================================
-- 0004_extend_next_session_index_range.sql
-- Extiende el rango de twins.next_session_index de 0..8 a 0..12 para acomodar
-- el curriculum expandido (12 slots: 8 dominios broad + 2 deep + synthesis +
-- gap_filling).
-- =============================================================================

alter table public.twins
  drop constraint if exists twins_next_session_index_check;

alter table public.twins
  add constraint twins_next_session_index_check
  check (next_session_index between 0 and 12);
