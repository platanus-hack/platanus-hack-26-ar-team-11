"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createAvatar } from "@dicebear/core";
import * as avataaars from "@dicebear/avataaars";
import { Check, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type AvatarConfig,
  AVATAR_ACCESSORIES_OPTIONS,
  AVATAR_CLOTHING_OPTIONS,
  AVATAR_EYEBROWS_OPTIONS,
  AVATAR_EYES_OPTIONS,
  AVATAR_FACIAL_HAIR_OPTIONS,
  AVATAR_MOUTH_OPTIONS,
  AVATAR_TOP_OPTIONS,
  type AvatarOption,
  CLOTHES_COLORS,
  configToOptions,
  HAIR_COLORS,
  SKIN_COLORS,
} from "@/types/avatar";
import { updateAvatarConfig } from "@/lib/auth/avatar-actions";
import { updateProfileName } from "@/lib/auth/profile-actions";

type CategoryKey =
  | "top"
  | "hairColor"
  | "skinColor"
  | "eyes"
  | "eyebrows"
  | "mouth"
  | "facialHair"
  | "accessories"
  | "clothing"
  | "clothesColor";

interface CategoryDef {
  key: CategoryKey;
  label: string;
  kind: "style" | "color";
}

const CATEGORIES: CategoryDef[] = [
  { key: "top", label: "Pelo", kind: "style" },
  { key: "hairColor", label: "Color de pelo", kind: "color" },
  { key: "eyes", label: "Ojos", kind: "style" },
  { key: "eyebrows", label: "Cejas", kind: "style" },
  { key: "mouth", label: "Boca", kind: "style" },
  { key: "facialHair", label: "Barba", kind: "style" },
  { key: "accessories", label: "Lentes", kind: "style" },
  { key: "skinColor", label: "Piel", kind: "color" },
  { key: "clothing", label: "Ropa", kind: "style" },
  { key: "clothesColor", label: "Color ropa", kind: "color" },
];

function useAvatarSvg(config: AvatarConfig, seed: string, size = 256): string {
  return useMemo(
    () =>
      createAvatar(avataaars, {
        seed,
        size,
        ...configToOptions(config),
      }).toString(),
    [config, seed, size],
  );
}

function ThumbAvatar({ config, seed }: { config: AvatarConfig; seed: string }) {
  const svg = useAvatarSvg(config, seed, 80);
  return (
    <div
      className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

interface AvatarCustomizerProps {
  initialConfig: AvatarConfig;
  seed: string;
  initialName: string;
}

export function AvatarCustomizer({
  initialConfig,
  seed,
  initialName,
}: AvatarCustomizerProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);
  const [savedConfig, setSavedConfig] = useState<AvatarConfig>(initialConfig);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("top");
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);
  const [savedName, setSavedName] = useState(initialName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isNamePending, startNameTransition] = useTransition();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameValid = name.trim().length > 0;

  const previewSvg = useAvatarSvg(config, seed, 256);

  const dirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(savedConfig),
    [config, savedConfig],
  );

  function setField<K extends CategoryKey>(key: K, value: AvatarConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      const res = await updateAvatarConfig(config);
      if (res.ok) {
        setSavedConfig(config);
      } else {
        toast.error(res.error ?? "No se pudo guardar el avatar");
      }
    });
  }

  function handleReset() {
    setConfig(savedConfig);
  }

  function startEditingName() {
    setIsEditingName(true);
    queueMicrotask(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    });
  }

  function cancelEditingName() {
    setName(savedName);
    setIsEditingName(false);
  }

  function handleSaveName() {
    if (!nameValid) return;
    const trimmed = name.trim();
    if (trimmed === savedName.trim()) {
      setIsEditingName(false);
      return;
    }
    startNameTransition(async () => {
      const res = await updateProfileName(trimmed);
      if (res.ok) {
        setSavedName(trimmed);
        setIsEditingName(false);
        toast.success("Nombre guardado");
      } else {
        toast.error(res.error ?? "No se pudo guardar el nombre");
      }
    });
  }

  function handleNameBlur() {
    if (isNamePending) return;
    // Click outside while empty → discard, no toast.
    if (!nameValid) {
      cancelEditingName();
      return;
    }
    handleSaveName();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10">
      <header className="text-center">
        <span className="block text-sm uppercase tracking-[0.2em] text-secondary">
          Tu perfil
        </span>
        <h1 className="mt-3 text-balance text-3xl font-black sm:text-4xl">
          Personalizá tu Twin
        </h1>
      </header>

      <div className="-mt-5 flex flex-col items-center gap-5">
        <div className="relative flex w-72 items-center">
          {isEditingName ? (
            <Input
              ref={nameInputRef}
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveName();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEditingName();
                }
              }}
              onBlur={handleNameBlur}
              disabled={isNamePending}
              placeholder="Tu nombre"
              className="h-12 w-full px-11 text-center !text-2xl"
              aria-label="Editar nombre"
            />
          ) : (
            <button
              type="button"
              onClick={startEditingName}
              className={cn(
                "w-full cursor-pointer px-11 text-center text-2xl font-medium transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !savedName && "text-muted-foreground italic",
              )}
            >
              {savedName || "Tu nombre"}
            </button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => {
              // Keep input focused so onBlur doesn't race the click handler.
              if (isEditingName) e.preventDefault();
            }}
            onClick={isEditingName ? handleSaveName : startEditingName}
            disabled={isEditingName && (!nameValid || isNamePending)}
            className={cn(
              "absolute right-0 h-12 w-12 cursor-pointer text-muted-foreground",
              isEditingName &&
                "hover:!bg-transparent dark:hover:!bg-transparent",
            )}
            aria-label={isEditingName ? "Confirmar nombre" : "Editar nombre"}
          >
            {isEditingName ? (
              <Check className="h-5 w-5" />
            ) : (
              <Pencil className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div
          className="h-56 w-56 overflow-hidden rounded-2xl border border-border/60 bg-card sm:h-72 sm:w-72 [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: previewSvg }}
        />

        <div className="flex w-full max-w-md items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleReset}
            disabled={!dirty || isPending}
            className="flex-1"
          >
            Descartar
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleSave}
            disabled={!dirty || isPending}
            className="flex-1"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              "Guardar avatar"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              activeCategory === cat.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/80 hover:border-primary/40",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <CategoryGrid
        category={activeCategory}
        config={config}
        seed={seed}
        onChange={setField}
      />
    </div>
  );
}

function CategoryGrid({
  category,
  config,
  seed,
  onChange,
}: {
  category: CategoryKey;
  config: AvatarConfig;
  seed: string;
  onChange: <K extends CategoryKey>(key: K, value: AvatarConfig[K]) => void;
}) {
  switch (category) {
    case "top":
      return <StyleGrid options={AVATAR_TOP_OPTIONS} fieldKey="top" config={config} seed={seed} onChange={onChange} />;
    case "eyes":
      return <StyleGrid options={AVATAR_EYES_OPTIONS} fieldKey="eyes" config={config} seed={seed} onChange={onChange} />;
    case "eyebrows":
      return <StyleGrid options={AVATAR_EYEBROWS_OPTIONS} fieldKey="eyebrows" config={config} seed={seed} onChange={onChange} />;
    case "mouth":
      return <StyleGrid options={AVATAR_MOUTH_OPTIONS} fieldKey="mouth" config={config} seed={seed} onChange={onChange} />;
    case "facialHair":
      return <StyleGrid options={AVATAR_FACIAL_HAIR_OPTIONS} fieldKey="facialHair" config={config} seed={seed} onChange={onChange} />;
    case "accessories":
      return <StyleGrid options={AVATAR_ACCESSORIES_OPTIONS} fieldKey="accessories" config={config} seed={seed} onChange={onChange} />;
    case "clothing":
      return <StyleGrid options={AVATAR_CLOTHING_OPTIONS} fieldKey="clothing" config={config} seed={seed} onChange={onChange} />;
    case "hairColor":
      return <ColorGrid colors={HAIR_COLORS} fieldKey="hairColor" config={config} onChange={onChange} />;
    case "skinColor":
      return <ColorGrid colors={SKIN_COLORS} fieldKey="skinColor" config={config} onChange={onChange} />;
    case "clothesColor":
      return <ColorGrid colors={CLOTHES_COLORS} fieldKey="clothesColor" config={config} onChange={onChange} />;
  }
}

function StyleGrid<K extends CategoryKey>({
  options,
  fieldKey,
  config,
  seed,
  onChange,
}: {
  options: AvatarOption<AvatarConfig[K] & string>[];
  fieldKey: K;
  config: AvatarConfig;
  seed: string;
  onChange: (key: K, value: AvatarConfig[K]) => void;
}) {
  const current = config[fieldKey];
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {options.map((opt) => {
        const previewConfig = { ...config, [fieldKey]: opt.value } as AvatarConfig;
        const selected = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(fieldKey, opt.value as AvatarConfig[K])}
            className={cn(
              "group flex flex-col items-center gap-1 rounded-xl border p-2 transition",
              selected
                ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                : "border-border/60 bg-card hover:border-primary/40",
            )}
          >
            <div className="h-20 w-20 overflow-hidden rounded-lg bg-muted/40">
              <ThumbAvatar config={previewConfig} seed={seed} />
            </div>
            <span className="line-clamp-1 text-sm text-foreground/80">
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ColorGrid<K extends CategoryKey>({
  colors,
  fieldKey,
  config,
  onChange,
}: {
  colors: string[];
  fieldKey: K;
  config: AvatarConfig;
  onChange: (key: K, value: AvatarConfig[K]) => void;
}) {
  const current = config[fieldKey];
  return (
    <div className="grid grid-cols-6 gap-3 sm:grid-cols-9 md:grid-cols-12">
      {colors.map((color) => {
        const selected = current === color;
        const isTransparent = color === "transparent";
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(fieldKey, color as AvatarConfig[K])}
            aria-label={isTransparent ? "Transparente" : `#${color}`}
            className={cn(
              "h-10 w-10 rounded-full border transition",
              selected
                ? "border-foreground ring-2 ring-primary/40"
                : "border-border/60 hover:border-foreground/40",
            )}
            style={{
              background: isTransparent
                ? "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 50% / 14px 14px"
                : `#${color}`,
            }}
          />
        );
      })}
    </div>
  );
}
