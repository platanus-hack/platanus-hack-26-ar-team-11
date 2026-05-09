import { UserAvatar } from "@/components/avatar/UserAvatar";
import type { AvatarConfig } from "@/types/avatar";

const HERO_AVATAR_CONFIG: AvatarConfig = {
  top: "longButNotTooLong",
  hairColor: "d6b370",
  skinColor: "ffdbb4",
  eyes: "wink",
  eyebrows: "default",
  mouth: "smile",
  facialHair: "none",
  facialHairColor: "2c1b18",
  accessories: "none",
  clothing: "blazerAndShirt",
  clothesColor: "d4a017",
  backgroundColor: "transparent",
};

// Frame del Twin: cartoon avatar con halo amber + orbits indigo.
export function HeroAvatar({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Avatar de tu Twin"
      className={[
        "relative mx-auto flex aspect-square w-72 items-center justify-center sm:w-96 lg:w-[28rem]",
        className ?? "",
      ].join(" ")}
    >
      <span className="hero-avatar-orbit hero-avatar-orbit--outer" aria-hidden />
      <span className="hero-avatar-orbit hero-avatar-orbit--mid" aria-hidden />
      <span className="hero-avatar-halo" aria-hidden />
      <div className="hero-avatar-frame" aria-hidden>
        <UserAvatar
          config={HERO_AVATAR_CONFIG}
          seed="twin-hero"
          ariaLabel="Avatar de tu Twin"
          className="h-full w-full"
        />
      </div>
      <span className="hero-avatar-particle hero-avatar-particle--a" aria-hidden />
      <span className="hero-avatar-particle hero-avatar-particle--b" aria-hidden />
      <span className="hero-avatar-particle hero-avatar-particle--c" aria-hidden />
      <span className="hero-avatar-particle hero-avatar-particle--d" aria-hidden />
    </div>
  );
}
