import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const goalSchema = z.object({
  treatmentPlanId: z.string().min(1),
  patientId: z.string().min(1),
  parentGoalId: z.string().optional().nullable(),
  level: z.enum(["LONG_TERM", "SHORT_TERM", "OBJECTIVE"]),
  description: z.string().min(1),
  baseline: z.string().optional(),
  targetCriteria: z.string().optional(),
  targetDate: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const parsed = goalSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { targetDate, parentGoalId, ...data } = parsed.data;
  const goal = await db.goal.create({
    data: {
      ...data,
      parentGoalId: parentGoalId || null,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });
  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "Goal",
    entityId: goal.id,
  });
  return NextResponse.json(goal, { status: 201 });
}
