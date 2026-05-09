export interface BuholingoExercise {
  id: string;
  prompt_es: string;
  answer_en: string;
  hint?: string;
  interest_used?: string;
}

export interface PersonalizedLesson {
  topic: string;
  exercises: BuholingoExercise[];
  twin_facts_used: string[];
  summary: string;
}
