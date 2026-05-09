/**
 * Permissive answer matching for translation exercises:
 * lowercase, strip punctuation, collapse spaces.
 */
export function normalizeAnswer(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.,!¡¿?;:'"()[\]{}\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isCorrect(userAnswer: string, expected: string): boolean {
  if (!userAnswer.trim()) return false;
  return normalizeAnswer(userAnswer) === normalizeAnswer(expected);
}
