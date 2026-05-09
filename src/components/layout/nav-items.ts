export interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/dashboard", label: "Agente" },
  { href: "/skills", label: "Skills" },
  { href: "/sessions", label: "Sesiones" },
  { href: "/connected-apps", label: "Aplicaciones" },
] as const;
