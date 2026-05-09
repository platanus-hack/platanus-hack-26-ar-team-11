import { afterEach, describe, expect, it, vi } from "vitest";

const { signOut, redirect } = vi.hoisted(() => ({
  signOut: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
}));

vi.mock("../server", () => ({ signOut }));
vi.mock("next/navigation", () => ({ redirect }));

import { signOutAction } from "../actions";

describe("signOutAction", () => {
  afterEach(() => {
    signOut.mockReset();
    redirect.mockClear();
  });

  it("calls supabase signOut and redirects to /", async () => {
    signOut.mockResolvedValue(undefined);
    await expect(signOutAction()).rejects.toThrow("__redirect__:/");
    expect(signOut).toHaveBeenCalledOnce();
  });
});
