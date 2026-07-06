import type {
  AssessmentItem,
  ComputedScores,
  Responses,
  ScoringConfig,
  SectionScore,
  TemplateSchema,
} from "./types";

function itemMax(item: AssessmentItem): number {
  if (item.type === "scale" && item.options?.length) {
    return Math.max(...item.options.map((o) => Number(o.value) || 0));
  }
  if (item.type === "number" || item.type === "boolean") {
    return item.maxScore ?? 0;
  }
  return 0;
}

function itemScore(item: AssessmentItem, raw: unknown): number {
  if (raw === null || raw === undefined || raw === "") return 0;
  let value = 0;
  if (item.type === "scale" || item.type === "number") value = Number(raw) || 0;
  else if (item.type === "boolean") value = raw === true || raw === "true" ? (item.maxScore ?? 1) : 0;
  else return 0; // text / choice are unscored

  const max = itemMax(item);
  value = Math.min(value, max);
  return item.reverse ? max - value : value;
}

/** Compute section scores, total and interpretation band for an assessment. */
export function computeScores(
  schema: TemplateSchema,
  scoring: ScoringConfig,
  responses: Responses,
): ComputedScores {
  const sections: SectionScore[] = schema.sections.map((section) => {
    let score = 0;
    let max = 0;
    for (const item of section.items) {
      max += itemMax(item);
      score += itemScore(item, responses[item.id]);
    }
    return { id: section.id, title: section.title, score, max };
  });

  let total = sections.reduce((s, x) => s + x.score, 0);
  const totalMax = sections.reduce((s, x) => s + x.max, 0);
  if (scoring.method === "average" && sections.length > 0) {
    total = Math.round((total / sections.length) * 10) / 10;
  }

  const percent = totalMax > 0 ? Math.round((total / totalMax) * 100) : 0;
  const matchOn = scoring.bandsOn === "percent" ? percent : total;
  const band =
    scoring.method === "none"
      ? null
      : (scoring.bands.find((b) => matchOn >= b.min && matchOn <= b.max) ??
        null);

  return { sections, total, totalMax, percent, band };
}

/** Auto-generated interpretation paragraph; therapists can edit it afterwards. */
export function buildInterpretation(
  templateName: string,
  patientName: string,
  scores: ComputedScores,
): string {
  const lines: string[] = [];
  lines.push(
    `${patientName} obtained a total score of ${scores.total}/${scores.totalMax} (${scores.percent}%) on the ${templateName}.`,
  );
  if (scores.band) {
    lines.push(
      `This score falls within the "${scores.band.label}" range. ${scores.band.interpretation}`,
    );
  }
  const scored = scores.sections.filter((s) => s.max > 0);
  if (scored.length > 1) {
    const strongest = [...scored].sort(
      (a, b) => b.score / b.max - a.score / a.max,
    )[0];
    const weakest = [...scored].sort(
      (a, b) => a.score / a.max - b.score / b.max,
    )[0];
    lines.push(
      `Relative strengths were observed in ${strongest.title} (${strongest.score}/${strongest.max}), while ${weakest.title} (${weakest.score}/${weakest.max}) emerged as the area of greatest need and is recommended as a focus for intervention planning.`,
    );
  }
  return lines.join(" ");
}
