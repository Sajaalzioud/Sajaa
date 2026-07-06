/**
 * Assessment template engine.
 *
 * A template's structure lives in `AssessmentTemplate.schema` (JSON) and its
 * scoring rules in `AssessmentTemplate.scoring` (JSON). These types define
 * both documents; `scoring.ts` computes results from therapist responses.
 */

export type ItemType =
  | "scale" // Likert-style option list, each option carries a numeric score
  | "choice" // categorical option list, unscored
  | "number" // raw numeric entry (counts, seconds…), scored directly
  | "boolean" // yes/no observation, yes = maxScore
  | "text"; // qualitative observation, never scored

export interface ItemOption {
  value: number | string;
  label: string;
}

export interface AssessmentItem {
  id: string;
  label: string;
  type: ItemType;
  help?: string;
  options?: ItemOption[]; // for scale / choice
  maxScore?: number; // for number / boolean
  /** When true, the item is scored as (max - value): lower raw = better. */
  reverse?: boolean;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  items: AssessmentItem[];
}

export interface TemplateSchema {
  sections: AssessmentSection[];
}

export interface ScoringBand {
  min: number;
  max: number;
  label: string; // e.g. "Typical Performance"
  interpretation: string; // sentence used in the auto-generated report
}

export interface ScoringConfig {
  method: "sum" | "average" | "none";
  /** Whether bands are matched against the raw total or percentage of max. */
  bandsOn?: "raw" | "percent";
  bands: ScoringBand[];
}

export interface SectionScore {
  id: string;
  title: string;
  score: number;
  max: number;
}

export interface ComputedScores {
  sections: SectionScore[];
  total: number;
  totalMax: number;
  percent: number;
  band: ScoringBand | null;
}

export type Responses = Record<string, string | number | boolean | null>;
