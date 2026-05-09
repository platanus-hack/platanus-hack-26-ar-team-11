import {
  Heart,
  MapPin,
  MessageCircle,
  Music,
  Plane,
  Shirt,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Domain } from "@/types";

export interface DomainVisual {
  icon: LucideIcon;
  tone: string;
  ring: string;
}

export const DOMAIN_VISUALS: Record<Domain, DomainVisual> = {
  music_taste: {
    icon: Music,
    tone: "bg-muted text-foreground",
    ring: "ring-border",
  },
  event_preferences: {
    icon: MapPin,
    tone: "bg-muted text-foreground",
    ring: "ring-border",
  },
  vibes: {
    icon: Heart,
    tone: "bg-muted text-foreground",
    ring: "ring-border",
  },
  communication_style: {
    icon: MessageCircle,
    tone: "bg-muted text-foreground",
    ring: "ring-border",
  },
  spending_profile: {
    icon: Wallet,
    tone: "bg-muted text-foreground",
    ring: "ring-border",
  },
  fashion_taste: {
    icon: Shirt,
    tone: "bg-muted text-foreground",
    ring: "ring-border",
  },
  food_taste: {
    icon: UtensilsCrossed,
    tone: "bg-muted text-foreground",
    ring: "ring-border",
  },
  travel_style: {
    icon: Plane,
    tone: "bg-muted text-foreground",
    ring: "ring-border",
  },
};
