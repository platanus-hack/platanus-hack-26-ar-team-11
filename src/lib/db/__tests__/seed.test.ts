import { describe, expect, it, vi } from "vitest";

interface FakeRow {
  id: string;
  [key: string]: unknown;
}

interface FakeTable {
  rows: FakeRow[];
}

function makeFakeAdmin() {
  const tables: Record<string, FakeTable> = {
    twins: { rows: [] },
    twin_skills: { rows: [] },
    sessions: { rows: [] },
    developer_apps: { rows: [] },
  };

  const authUsers: { id: string; email: string }[] = [];

  const auth = {
    admin: {
      listUsers: vi.fn(async ({ page = 1, perPage = 200 }: { page?: number; perPage?: number } = {}) => {
        const start = (page - 1) * perPage;
        return { data: { users: authUsers.slice(start, start + perPage) }, error: null };
      }),
      createUser: vi.fn(async (input: { email: string }) => {
        const user = { id: `auth-${authUsers.length + 1}`, email: input.email };
        authUsers.push(user);
        return { data: { user }, error: null };
      }),
      updateUserById: vi.fn(async () => ({ data: null, error: null })),
    },
  };

  function buildBuilder(table: string) {
    const t = tables[table];
    let filters: Record<string, unknown> = {};
    let pendingInsert: Record<string, unknown> | null = null;
    let pendingUpdate: Record<string, unknown> | null = null;
    let pendingUpsert: Record<string, unknown> | null = null;
    let upsertOnConflict: string | null = null;

    const builder = {
      select(_cols?: string) {
        return builder;
      },
      eq(col: string, value: unknown) {
        filters[col] = value;
        return builder;
      },
      maybeSingle() {
        const match = t.rows.find((r) =>
          Object.entries(filters).every(([k, v]) => r[k] === v),
        );
        filters = {};
        return Promise.resolve({ data: match ?? null, error: null });
      },
      single() {
        const match = t.rows.find((r) =>
          Object.entries(filters).every(([k, v]) => r[k] === v),
        );
        filters = {};
        return Promise.resolve({ data: match ?? null, error: null });
      },
      insert(values: Record<string, unknown>) {
        pendingInsert = values;
        const newBuilder = {
          select() {
            return newBuilder;
          },
          single() {
            const row = { id: `id-${t.rows.length + 1}`, ...(pendingInsert ?? {}) };
            t.rows.push(row);
            return Promise.resolve({ data: row, error: null });
          },
          then(onFulfilled: (v: { data: null; error: null }) => unknown) {
            const row = { id: `id-${t.rows.length + 1}`, ...(pendingInsert ?? {}) };
            t.rows.push(row);
            return Promise.resolve({ data: null, error: null }).then(onFulfilled);
          },
        };
        return newBuilder;
      },
      update(values: Record<string, unknown>) {
        pendingUpdate = values;
        return {
          eq(col: string, value: unknown) {
            const match = t.rows.find((r) => r[col] === value);
            if (match && pendingUpdate) Object.assign(match, pendingUpdate);
            return Promise.resolve({ data: null, error: null });
          },
        };
      },
      upsert(values: Record<string, unknown>, opts?: { onConflict?: string }) {
        pendingUpsert = values;
        upsertOnConflict = opts?.onConflict ?? null;
        const conflictKeys = upsertOnConflict?.split(",").map((s) => s.trim()) ?? ["id"];
        const existing = t.rows.find((r) =>
          conflictKeys.every((k) => r[k] === (pendingUpsert ?? {})[k]),
        );
        if (existing) {
          Object.assign(existing, pendingUpsert);
        } else {
          t.rows.push({ id: `id-${t.rows.length + 1}`, ...(pendingUpsert ?? {}) });
        }
        return Promise.resolve({ data: null, error: null });
      },
    };
    return builder;
  }

  const admin = {
    auth,
    from(table: string) {
      if (!tables[table]) tables[table] = { rows: [] };
      return buildBuilder(table);
    },
  };

  return { admin, tables, authUsers };
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { createAdminClient } from "@/lib/supabase/admin";
import { runSeed } from "../seed";

describe("runSeed", () => {
  it("is idempotent: second run does not duplicate rows", async () => {
    const { admin, tables, authUsers } = makeFakeAdmin();
    vi.mocked(createAdminClient).mockReturnValue(admin as unknown as ReturnType<typeof createAdminClient>);

    const first = await runSeed();
    const usersAfterFirst = authUsers.length;
    const twinsAfterFirst = tables.twins.rows.length;
    const skillsAfterFirst = tables.twin_skills.rows.length;
    const sessionsAfterFirst = tables.sessions.rows.length;
    const appsAfterFirst = tables.developer_apps.rows.length;

    expect(first.users.created).toBe(2);
    expect(twinsAfterFirst).toBe(2);
    expect(appsAfterFirst).toBe(2);

    const second = await runSeed();
    expect(authUsers.length).toBe(usersAfterFirst);
    expect(tables.twins.rows.length).toBe(twinsAfterFirst);
    expect(tables.twin_skills.rows.length).toBe(skillsAfterFirst);
    expect(tables.sessions.rows.length).toBe(sessionsAfterFirst);
    expect(tables.developer_apps.rows.length).toBe(appsAfterFirst);
    expect(second.users.created).toBe(0);
    expect(second.users.updated).toBe(2);
    expect(second.sessions.created).toBe(0);
    expect(second.apps.created).toBe(0);
    expect(second.apps.updated).toBe(2);
  });
});
