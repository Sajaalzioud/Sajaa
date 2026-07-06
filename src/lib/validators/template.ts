import { z } from "zod";

export const templatePayload = z.object({
  name: z.string().min(1),
  abbreviation: z.string().optional(),
  category: z.string().min(1),
  description: z.string().optional(),
  ageMinMonths: z.number().int().nullable().optional(),
  ageMaxMonths: z.number().int().nullable().optional(),
  isStandardized: z.boolean(),
  schema: z.object({ sections: z.array(z.any()) }),
  scoring: z.object({
    method: z.enum(["sum", "average", "none"]),
    bandsOn: z.enum(["raw", "percent"]).optional(),
    bands: z.array(
      z.object({
        min: z.number(),
        max: z.number(),
        label: z.string(),
        interpretation: z.string(),
      }),
    ),
  }),
});

export type TemplatePayload = z.infer<typeof templatePayload>;
