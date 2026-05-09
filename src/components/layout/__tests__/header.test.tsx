import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";

const { getCurrentUser } = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({ getCurrentUser }));

import { Header } from "../header";

describe("Header", () => {
  afterEach(() => {
    getCurrentUser.mockReset();
  });

  it("shows login + signup CTAs when no user", async () => {
    getCurrentUser.mockResolvedValue(null);
    const html = renderToString(await Header({}));
    expect(html).toContain("Login");
    expect(html).toContain("Crear mi Twin");
  });

  it("shows user menu when logged in", async () => {
    getCurrentUser.mockResolvedValue({
      id: "u1",
      email: "demo1@twin-protocol.example",
      user_metadata: { name: "Manuel" },
    });
    const html = renderToString(await Header({}));
    expect(html).toContain("Manuel");
    expect(html).toContain("Abrir menú de usuario");
    expect(html).not.toContain(">Login<");
  });

  it("hides nav entirely on minimal variant", async () => {
    const html = renderToString(await Header({ variant: "minimal" }));
    expect(html).toContain("Twin");
    expect(html).not.toContain("Login");
    expect(html).not.toContain("Crear mi Twin");
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("auth variant shows logo only without auth nav", async () => {
    getCurrentUser.mockResolvedValue(null);
    const html = renderToString(await Header({ variant: "auth" }));
    expect(html).toContain("Twin");
    expect(html).not.toContain("Login");
  });
});
