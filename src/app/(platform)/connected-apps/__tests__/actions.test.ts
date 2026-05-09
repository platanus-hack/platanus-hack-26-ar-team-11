import { afterEach, describe, expect, it, vi } from "vitest";

const { requireUser, revokeConnection, revalidatePath } = vi.hoisted(() => ({
  requireUser: vi.fn(),
  revokeConnection: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ requireUser }));
vi.mock("@/lib/db/connections", () => ({ revokeConnection }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { revokeConnectionAction } from "../actions";

describe("revokeConnectionAction", () => {
  afterEach(() => {
    requireUser.mockReset();
    revokeConnection.mockReset();
    revalidatePath.mockReset();
  });

  it("revokes when called by owner", async () => {
    requireUser.mockResolvedValue({ id: "u1" });
    revokeConnection.mockResolvedValue({ ok: true });

    const result = await revokeConnectionAction("c1");
    expect(result).toEqual({ ok: true });
    expect(revokeConnection).toHaveBeenCalledWith("c1", "u1");
    expect(revalidatePath).toHaveBeenCalledWith("/connected-apps");
  });

  it("returns forbidden when not owner", async () => {
    requireUser.mockResolvedValue({ id: "u1" });
    revokeConnection.mockResolvedValue({ ok: false, error: "forbidden" });

    const result = await revokeConnectionAction("c1");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("forbidden");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects empty connectionId", async () => {
    const result = await revokeConnectionAction("");
    expect(result.ok).toBe(false);
    expect(requireUser).not.toHaveBeenCalled();
  });
});
