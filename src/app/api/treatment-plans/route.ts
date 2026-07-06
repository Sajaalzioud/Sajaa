import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const planSchema = z.object({
  patientId: z.string().min(1),
  title: z.string().min(1),
  startDate: z.string().min(1),
  frequencyPerWeek: z.coerce.number().int().min(1).max(14),
  sessionMinutes: z.coerce.number().int().min(15).max(180),
  focusAreas: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const parsed = planSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { startDate, ...data } = parsed.data;
  const plan = await db.treatmentPlan.create({
    data: { ...data, startDate: new Date(startDate), therapistId: user.id },
  });
  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "TreatmentPlan",
    entityId: plan.id,
  });
  return NextResponse.json(plan, { status: 201 });
}
