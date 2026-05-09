export interface TrainingSettings {
  avatar_enabled: boolean;
}

export const DEFAULT_TRAINING_SETTINGS: TrainingSettings = {
  avatar_enabled: true,
};

export function parseTrainingSettings(raw: unknown): TrainingSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_TRAINING_SETTINGS };
  const obj = raw as Partial<TrainingSettings>;
  return {
    avatar_enabled:
      typeof obj.avatar_enabled === "boolean"
        ? obj.avatar_enabled
        : DEFAULT_TRAINING_SETTINGS.avatar_enabled,
  };
}
