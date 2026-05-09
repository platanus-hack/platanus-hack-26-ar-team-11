import { afterEach, describe, expect, it, vi } from "vitest";

const { signInWithPassword, redirect } = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
}));

vi.mock("@/lib/auth/server", () => ({ signInWithPassword }));
vi.mock("next/navigation", () => ({ redirect }));

import { signInAction } from "../actions";

function makeFormData(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  return fd;
}

describe("signInAction", () => {
  afterEach(() => {
    signInWithPassword.mockReset();
    redirect.mockClear();
  });

  it("redirects to /dashboard on success without return_to", async () => {
    signInWithPassword.mockResolvedValue({ user: { id: "u1" }, error: null });

    await expect(
      signInAction(undefined, makeFormData({ email: "a@b.com", password: "12345678" })),
    ).rejects.toThrow("__redirect__:/dashboard");
    expect(signInWithPassword).toHaveBeenCalledWith("a@b.com", "12345678");
  });

  it("redirects to local return_to URL on success", async () => {
    signInWithPassword.mockResolvedValue({ user: { id: "u1" }, error: null });

    await expect(
      signInAction(
        undefined,
        makeFormData({ email: "a@b.com", password: "12345678", return_to: "/skills" }),
      ),
    ).rejects.toThrow("__redirect__:/skills");
  });

  it("ignores external return_to URLs to prevent open redirect", async () => {
    signInWithPassword.mockResolvedValue({ user: { id: "u1" }, error: null });

    await expect(
      signInAction(
        undefined,
        makeFormData({
          email: "a@b.com",
          password: "12345678",
          return_to: "https://evil.com",
        }),
      ),
    ).rejects.toThrow("__redirect__:/dashboard");
  });

  it("ignores protocol-relative URLs", async () => {
    signInWithPassword.mockResolvedValue({ user: { id: "u1" }, error: null });

    await expect(
      signInAction(
        undefined,
        makeFormData({ email: "a@b.com", password: "12345678", return_to: "//evil.com" }),
      ),
    ).rejects.toThrow("__redirect__:/dashboard");
  });

  it("returns generic error on bad credentials without leaking info", async () => {
    signInWithPassword.mockResolvedValue({
      user: null,
      error: { message: "Invalid login credentials" },
    });

    const result = await signInAction(
      undefined,
      makeFormData({ email: "a@b.com", password: "wrongpass" }),
    );
    expect(result).toEqual({ error: "Credenciales inválidas." });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("returns error on missing fields", async () => {
    const result = await signInAction(undefined, makeFormData({ email: "", password: "" }));
    expect(result?.error).toBeDefined();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});
