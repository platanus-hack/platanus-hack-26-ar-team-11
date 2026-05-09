# Supabase migrations

> Source of truth para el schema: `CONTRACTS.md` §DB_SCHEMA en root del repo.

## Aplicar migrations al proyecto cloud

Solo este PC necesita Supabase CLI — los AFK PCs no.

```bash
# 1. Login (interactive, una sola vez):
supabase login

# 2. Linkear el repo al proyecto cloud (interactive, pide DB password):
supabase link --project-ref oxvmoyafsetcrnwkxloh

# 3. Aplicar migrations:
pnpm db:push
# (equivale a: supabase db push)
```

## Crear migration nueva

```bash
supabase migration new <descriptive_name>
# Ej: supabase migration new add_user_settings
```

Editar el archivo SQL generado en `supabase/migrations/`, luego `pnpm db:push`.

## Reset (solo dev local — NUNCA en cloud)

```bash
supabase db reset  # local only
```

## Verificar schema

```bash
supabase db diff   # diff entre local y remote
```

## Estado actual

- `0001_init_schema.sql` — 8 tablas + enums + triggers + handle_new_user (auto-create twin al signup).
- `0002_rls_policies.sql` — RLS policies por tabla.
