import type { Options as AvataaarsOptions } from "@dicebear/avataaars";

export type AvatarTop = NonNullable<AvataaarsOptions["top"]>[number];
export type AvatarEyes = NonNullable<AvataaarsOptions["eyes"]>[number];
export type AvatarEyebrows = NonNullable<AvataaarsOptions["eyebrows"]>[number];
export type AvatarMouth = NonNullable<AvataaarsOptions["mouth"]>[number];
export type AvatarFacialHair = NonNullable<AvataaarsOptions["facialHair"]>[number];
export type AvatarAccessories = NonNullable<AvataaarsOptions["accessories"]>[number];
export type AvatarClothing = NonNullable<AvataaarsOptions["clothing"]>[number];

export interface AvatarConfig {
  top: AvatarTop;
  hairColor: string;
  skinColor: string;
  eyes: AvatarEyes;
  eyebrows: AvatarEyebrows;
  mouth: AvatarMouth;
  facialHair: AvatarFacialHair | "none";
  facialHairColor: string;
  accessories: AvatarAccessories | "none";
  clothing: AvatarClothing;
  clothesColor: string;
  backgroundColor: string;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  top: "shortFlat",
  hairColor: "2c1b18",
  skinColor: "edb98a",
  eyes: "default",
  eyebrows: "default",
  mouth: "smile",
  facialHair: "none",
  facialHairColor: "2c1b18",
  accessories: "none",
  clothing: "shirtCrewNeck",
  clothesColor: "65c9ff",
  backgroundColor: "transparent",
};

export function configToOptions(config: AvatarConfig): AvataaarsOptions {
  const options: AvataaarsOptions = {
    top: [config.top],
    topProbability: 100,
    hairColor: [config.hairColor],
    skinColor: [config.skinColor],
    eyes: [config.eyes],
    eyebrows: [config.eyebrows],
    mouth: [config.mouth],
    clothing: [config.clothing],
    clothesColor: [config.clothesColor],
    backgroundColor: [config.backgroundColor],
  };

  if (config.facialHair === "none") {
    options.facialHairProbability = 0;
  } else {
    options.facialHair = [config.facialHair];
    options.facialHairColor = [config.facialHairColor];
    options.facialHairProbability = 100;
  }

  if (config.accessories === "none") {
    options.accessoriesProbability = 0;
  } else {
    options.accessories = [config.accessories];
    options.accessoriesProbability = 100;
  }

  return options;
}

const PARTIAL_KEYS: ReadonlyArray<keyof AvatarConfig> = [
  "top",
  "hairColor",
  "skinColor",
  "eyes",
  "eyebrows",
  "mouth",
  "facialHair",
  "facialHairColor",
  "accessories",
  "clothing",
  "clothesColor",
  "backgroundColor",
];

export function parseAvatarConfig(value: unknown): AvatarConfig {
  if (!value || typeof value !== "object") return { ...DEFAULT_AVATAR_CONFIG };
  const merged = { ...DEFAULT_AVATAR_CONFIG };
  const obj = value as Record<string, unknown>;
  for (const key of PARTIAL_KEYS) {
    const v = obj[key];
    if (typeof v === "string" && v.length > 0 && v.length < 64) {
      (merged as Record<string, string>)[key] = v;
    }
  }
  return merged;
}

export interface AvatarOption<T extends string = string> {
  value: T;
  label: string;
}

export const AVATAR_TOP_OPTIONS: AvatarOption<AvatarTop>[] = [
  { value: "shortFlat", label: "Corto liso" },
  { value: "shortRound", label: "Corto redondo" },
  { value: "shortCurly", label: "Corto rizado" },
  { value: "shortWaved", label: "Corto ondulado" },
  { value: "theCaesar", label: "César" },
  { value: "sides", label: "Rapado a los lados" },
  { value: "shavedSides", label: "Rapado" },
  { value: "straight01", label: "Lacio" },
  { value: "straight02", label: "Lacio 2" },
  { value: "straightAndStrand", label: "Lacio con mechón" },
  { value: "longButNotTooLong", label: "Mediano" },
  { value: "bob", label: "Bob" },
  { value: "bun", label: "Rodete" },
  { value: "curly", label: "Rulos" },
  { value: "curvy", label: "Ondulado" },
  { value: "fro", label: "Afro" },
  { value: "froBand", label: "Afro con vincha" },
  { value: "dreads", label: "Rastas" },
  { value: "dreads01", label: "Rastas 2" },
  { value: "dreads02", label: "Rastas 3" },
  { value: "shaggy", label: "Despeinado" },
  { value: "shaggyMullet", label: "Mullet" },
  { value: "miaWallace", label: "Mia Wallace" },
  { value: "frida", label: "Frida" },
  { value: "frizzle", label: "Frizz" },
  { value: "bigHair", label: "Voluminoso" },
  { value: "hat", label: "Gorra" },
  { value: "hijab", label: "Hijab" },
  { value: "turban", label: "Turbante" },
  { value: "winterHat1", label: "Gorro 1" },
  { value: "winterHat02", label: "Gorro 2" },
  { value: "winterHat03", label: "Gorro 3" },
  { value: "winterHat04", label: "Gorro 4" },
];

export const AVATAR_EYES_OPTIONS: AvatarOption<AvatarEyes>[] = [
  { value: "default", label: "Normales" },
  { value: "happy", label: "Felices" },
  { value: "wink", label: "Guiño" },
  { value: "winkWacky", label: "Guiño bizarro" },
  { value: "squint", label: "Achicados" },
  { value: "surprised", label: "Sorprendidos" },
  { value: "side", label: "De costado" },
  { value: "closed", label: "Cerrados" },
  { value: "eyeRoll", label: "Girando" },
  { value: "hearts", label: "Corazones" },
  { value: "cry", label: "Llorando" },
  { value: "xDizzy", label: "Mareados" },
];

export const AVATAR_EYEBROWS_OPTIONS: AvatarOption<AvatarEyebrows>[] = [
  { value: "default", label: "Normales" },
  { value: "defaultNatural", label: "Naturales" },
  { value: "raisedExcited", label: "Arriba" },
  { value: "raisedExcitedNatural", label: "Arriba natural" },
  { value: "flatNatural", label: "Planas" },
  { value: "angry", label: "Enojadas" },
  { value: "angryNatural", label: "Enojadas nat." },
  { value: "sadConcerned", label: "Tristes" },
  { value: "sadConcernedNatural", label: "Tristes nat." },
  { value: "frownNatural", label: "Fruncidas" },
  { value: "upDown", label: "Asimétricas" },
  { value: "upDownNatural", label: "Asimétricas nat." },
  { value: "unibrowNatural", label: "Unibrow" },
];

export const AVATAR_MOUTH_OPTIONS: AvatarOption<AvatarMouth>[] = [
  { value: "smile", label: "Sonrisa" },
  { value: "twinkle", label: "Brillo" },
  { value: "default", label: "Normal" },
  { value: "serious", label: "Seria" },
  { value: "tongue", label: "Lengua" },
  { value: "eating", label: "Comiendo" },
  { value: "concerned", label: "Preocupada" },
  { value: "sad", label: "Triste" },
  { value: "disbelief", label: "Incrédula" },
  { value: "grimace", label: "Mueca" },
  { value: "screamOpen", label: "Grito" },
  { value: "vomit", label: "Vómito" },
];

export const AVATAR_FACIAL_HAIR_OPTIONS: AvatarOption<AvatarConfig["facialHair"]>[] = [
  { value: "none", label: "Sin barba" },
  { value: "beardLight", label: "Barba clara" },
  { value: "beardMedium", label: "Barba media" },
  { value: "beardMajestic", label: "Barba majestuosa" },
  { value: "moustacheFancy", label: "Bigote elegante" },
  { value: "moustacheMagnum", label: "Bigote Magnum" },
];

export const AVATAR_ACCESSORIES_OPTIONS: AvatarOption<AvatarConfig["accessories"]>[] = [
  { value: "none", label: "Ninguno" },
  { value: "round", label: "Redondos" },
  { value: "prescription01", label: "Lentes 1" },
  { value: "prescription02", label: "Lentes 2" },
  { value: "wayfarers", label: "Wayfarers" },
  { value: "sunglasses", label: "De sol" },
  { value: "kurt", label: "Kurt" },
  { value: "eyepatch", label: "Parche" },
];

export const AVATAR_CLOTHING_OPTIONS: AvatarOption<AvatarClothing>[] = [
  { value: "shirtCrewNeck", label: "Remera redondo" },
  { value: "shirtVNeck", label: "Remera V" },
  { value: "shirtScoopNeck", label: "Remera escote" },
  { value: "hoodie", label: "Buzo" },
  { value: "overall", label: "Jardinero" },
  { value: "graphicShirt", label: "Remera estampada" },
  { value: "blazerAndShirt", label: "Saco + camisa" },
  { value: "blazerAndSweater", label: "Saco + sweater" },
  { value: "collarAndSweater", label: "Cuello + sweater" },
];

export const SKIN_COLORS = [
  "614335",
  "ae5d29",
  "d08b5b",
  "edb98a",
  "ffdbb4",
  "fd9841",
  "f8d25c",
];

export const HAIR_COLORS = [
  "2c1b18",
  "4a312c",
  "724133",
  "a55728",
  "b58143",
  "d6b370",
  "ecdcbf",
  "e8e1e1",
  "c93305",
  "f59797",
];

export const CLOTHES_COLORS = [
  "262e33",
  "3c4f5c",
  "25557c",
  "5199e4",
  "65c9ff",
  "b1e2ff",
  "a7ffc4",
  "ffffb1",
  "ffafb9",
  "ff488e",
  "ff5c5c",
  "929598",
  "e6e6e6",
  "ffffff",
];

export const BACKGROUND_COLORS = [
  "transparent",
  "faf5ea",
  "f0e7d5",
  "e6dec9",
  "d4a017",
  "212842",
  "485d7a",
  "a39db3",
  "65c9ff",
  "ffafb9",
  "a7ffc4",
  "ffffff",
];
