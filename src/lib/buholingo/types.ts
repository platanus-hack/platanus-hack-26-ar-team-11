export interface BuholingoExercise {
  id: string;
  prompt_es: string;
  answer_en: string;
  hint?: string;
  interest_used?: string;
}

export interface PersonalizedLesson {
  exercises: BuholingoExercise[];
  twin_facts_used: string[];
  summary: string;
}
