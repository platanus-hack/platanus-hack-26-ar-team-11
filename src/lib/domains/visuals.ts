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
    tone: "bg-primary/10 text-primary",
    ring: "ring-primary/20",
  },
  event_preferences: {
    icon: MapPin,
    tone: "bg-secondary/15 text-secondary",
    ring: "ring-secondary/20",
  },
  vibes: {
    icon: Heart,
    tone: "bg-accent/20 text-accent-foreground",
    ring: "ring-accent/30",
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
    tone: "bg-secondary/15 text-secondary",
    ring: "ring-secondary/20",
  },
  food_taste: {
    icon: UtensilsCrossed,
    tone: "bg-accent/20 text-accent-foreground",
    ring: "ring-accent/30",
  },
  travel_style: {
    icon: Plane,
    tone: "bg-primary/10 text-primary",
    ring: "ring-primary/20",
  },
};
