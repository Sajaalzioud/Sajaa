/**
 * AI documentation assistant.
 *
 * Every action rewrites or generates clinical text. The system prompt pins
 * the model to occupational-therapy terminology and forbids inventing
 * patient-specific facts — the model may only rephrase, structure or extend
 * what the therapist provides.
 */

export const AI_ACTIONS = {
  improve: {
    label: "Improve wording",
    instruction:
      "Rewrite the text with professional occupational therapy wording. Preserve every fact exactly; do not add new clinical claims.",
  },
  grammar: {
    label: "Fix grammar",
    instruction:
      "Correct grammar, spelling and punctuation only. Keep the author's wording wherever it is already correct.",
  },
  professional: {
    label: "Make professional",
    instruction:
      "Rewrite in formal clinical-report register suitable for physicians, schools and insurers. Preserve all facts.",
  },
  summarize: {
    label: "Summarize",
    instruction:
      "Condense the text into a concise clinical summary keeping all clinically significant details.",
  },
  expand: {
    label: "Expand",
    instruction:
      "Expand the shorthand into complete professional sentences. Elaborate ONLY what is implied by the text; never invent measurements, scores or events.",
  },
  smartGoals: {
    label: "Draft SMART goals",
    instruction:
      "Based on the described needs, draft SMART occupational therapy goals (Specific, Measurable, Achievable, Relevant, Time-bound). Use the format: 'Within X weeks, [child] will [skill] with [criteria] in [condition].' Where a detail is unknown, leave a [bracketed placeholder] instead of inventing it.",
  },
  objectives: {
    label: "Treatment objectives",
    instruction:
      "Draft graded short-term treatment objectives that ladder toward the stated goals, each with a measurable criterion.",
  },
  interventions: {
    label: "Suggest interventions",
    instruction:
      "Suggest evidence-based pediatric OT intervention approaches appropriate to the described presentation (e.g. sensory integration, task-oriented training, CO-OP). For each, one sentence of rationale.",
  },
  activities: {
    label: "Suggest activities",
    instruction:
      "Suggest playful, age-appropriate therapy activities targeting the described skills, with grading up/down options.",
  },
  homeProgram: {
    label: "Home program ideas",
    instruction:
      "Draft parent-friendly home activities targeting the described goals: plain language, household materials, clear frequency.",
  },
  clinicalReasoning: {
    label: "Clinical reasoning",
    instruction:
      "Write a clinical reasoning narrative connecting the stated observations to occupational performance, using OT frames of reference. Reason only from the provided facts.",
  },
  recommendations: {
    label: "Recommendations",
    instruction:
      "Draft professional recommendations (frequency, duration, referrals, environment adaptations) that follow logically from the provided findings.",
  },
} as const;

export type AiActionKey = keyof typeof AI_ACTIONS;

export const AI_SYSTEM_PROMPT = `You are a documentation assistant for pediatric occupational therapists.
Rules:
- Use professional occupational therapy terminology (occupational performance, sensory processing, praxis, bilateral coordination, visual-motor integration, ADLs, etc.).
- NEVER invent patient-specific information: no fabricated names, ages, scores, dates, diagnoses or events. If a needed detail is missing, use a [bracketed placeholder].
- Person-first, respectful language.
- Return ONLY the resulting text, with no preamble, no explanations and no markdown fences.`;
