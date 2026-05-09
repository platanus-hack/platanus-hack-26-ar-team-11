import { afterEach, describe, expect, it, vi } from "vitest";

const { signUpWithPassword, signInWithPassword, redirect } = vi.hoisted(() => ({
  signUpWithPassword: vi.fn(),
  signInWithPassword: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
}));

vi.mock("@/lib/auth/server", () => ({ signUpWithPassword, signInWithPassword }));
vi.mock("next/navigation", () => ({ redirect }));

import { signUpAction } from "../actions";

function fd(values: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.append(k, v);
  return f;
}

const valid = { email: "a@b.com", password: "12345678", confirm_password: "12345678" };

describe("signUpAction", () => {
  afterEach(() => {
    signUpWithPassword.mockReset();
    signInWithPassword.mockReset();
    redirect.mockClear();
  });

  it("creates account and redirects to /dashboard", async () => {
    signUpWithPassword.mockResolvedValue({ user: { id: "u1" }, error: null });
    signInWithPassword.mockResolvedValue({ user: { id: "u1" }, error: null });

    await expect(signUpAction(undefined, fd(valid))).rejects.toThrow("__redirect__:/dashboard");
    expect(signUpWithPassword).toHaveBeenCalledWith("a@b.com", "12345678");
  });

  it("redirects to /auth/login if auto sign-in fails", async () => {
    signUpWithPassword.mockResolvedValue({ user: { id: "u1" }, error: null });
    signInWithPassword.mockResolvedValue({ user: null, error: { message: "x" } });

    await expect(signUpAction(undefined, fd(valid))).rejects.toThrow("__redirect__:/auth/login");
  });

  it("returns generic error when email already exists", async () => {
    signUpWithPassword.mockResolvedValue({
      user: null,
      error: { message: "User already registered" },
    });

    const result = await signUpAction(undefined, fd(valid));
    expect(result?.error).toMatch(/ya existe/i);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    const result = await signUpAction(
      undefined,
      fd({ email: "a@b.com", password: "12345678", confirm_password: "different" }),
    );
    expect(result?.error).toMatch(/no coinciden/i);
    expect(signUpWithPassword).not.toHaveBeenCalled();
  });

  it("rejects short passwords", async () => {
    const result = await signUpAction(
      undefined,
      fd({ email: "a@b.com", password: "short", confirm_password: "short" }),
    );
    expect(result?.error).toMatch(/8/);
    expect(signUpWithPassword).not.toHaveBeenCalled();
  });

  it("rejects empty fields", async () => {
    const result = await signUpAction(undefined, fd({ email: "", password: "", confirm_password: "" }));
    expect(result?.error).toBeDefined();
  });
});
