import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "../Hero";

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Hero", () => {
  it("muestra el mensaje principal en inglés y subtítulo en español", () => {
    render(<Hero isAuthenticated={false} />);
    expect(
      screen.getByRole("heading", { level: 1 }),
    ).toHaveTextContent("Your AI self, connected to every app.");
    expect(
      screen.getByText(/Creá tu Twin una vez\. Usalo en todas tus apps\./),
    ).toBeInTheDocument();
  });

  it("deslogueado: CTA primario va a signup, secundario a login", () => {
    render(<Hero isAuthenticated={false} />);
    const primary = screen.getByRole("link", { name: /Crear mi Twin/ });
    const secondary = screen.getByRole("link", { name: /Ya tengo cuenta/ });
    expect(primary.getAttribute("href")).toBe("/auth/signup");
    expect(secondary.getAttribute("href")).toBe("/auth/login");
  });

  it("logueado: CTA primario va al dashboard, secundario a apps", () => {
    render(<Hero isAuthenticated={true} />);
    expect(
      screen.getByRole("link", { name: /Ir al dashboard/ }).getAttribute("href"),
    ).toBe("/dashboard");
    expect(
      screen.getByRole("link", { name: /Ver apps conectadas/ }).getAttribute("href"),
    ).toBe("/connected-apps");
  });
});
