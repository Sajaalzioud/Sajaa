import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { computeScores, buildInterpretation } from "@/lib/assessment/scoring";
import type { ScoringConfig, TemplateSchema, Responses } from "@/lib/assessment/types";
import { fullName } from "@/lib/utils";

const patchSchema = z.object({
  responses: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  notes: z.string().optional(),
  interpretation: z.string().optional(),
  action: z.enum(["complete", "reopen"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const { action, ...data } = parsed.data;

  const existing = await db.assessment.findUnique({
    where: { id },
    include: { template: true, patient: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let extra = {};
  if (action === "complete") {
    const responses = (data.responses ??
      existing.responses) as Responses;
    const scores = computeScores(
      existing.template.schema as unknown as TemplateSchema,
      existing.template.scoring as unknown as ScoringConfig,
      responses,
    );
    extra = {
      status: "COMPLETED",
      completedAt: new Date(),
      scores: scores as unknown as object,
      // keep a therapist-edited interpretation if one was provided
      interpretation:
        data.interpretation ??
        buildInterpretation(
          existing.template.name,
          fullName(existing.patient),
          scores,
        ),
    };
  } else if (action === "reopen") {
    extra = { status: "IN_PROGRESS", completedAt: null };
  }

  const assessment = await db.assessment.update({
    where: { id },
    data: { ...data, ...extra },
  });
  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Assessment",
    entityId: id,
    meta: action ? { action } : undefined,
  });
  return NextResponse.json(assessment);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  await db.assessment.delete({ where: { id } });
  await audit({
    userId: user.id,
    action: "DELETE",
    entityType: "Assessment",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
