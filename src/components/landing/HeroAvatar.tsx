// Avatar visual del Twin para el hero — esfera abstracta con halo dorado
// y orbits suaves. CSS-only animation: liviano y sin canvas/WebGL.

export function HeroAvatar({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Twin avatar"
      className={[
        "relative mx-auto flex aspect-square w-72 items-center justify-center sm:w-96 lg:w-[28rem]",
        className ?? "",
      ].join(" ")}
    >
      <span className="hero-avatar-orbit hero-avatar-orbit--outer" aria-hidden />
      <span className="hero-avatar-orbit hero-avatar-orbit--mid" aria-hidden />
      <span className="hero-avatar-halo" aria-hidden />
      <span className="hero-avatar-core" aria-hidden />
      <span className="hero-avatar-particle hero-avatar-particle--a" aria-hidden />
      <span className="hero-avatar-particle hero-avatar-particle--b" aria-hidden />
      <span className="hero-avatar-particle hero-avatar-particle--c" aria-hidden />
      <span className="hero-avatar-particle hero-avatar-particle--d" aria-hidden />
    </div>
  );
}
