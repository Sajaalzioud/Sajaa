import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const progressSchema = z.object({
  value: z.coerce.number().int().min(0).max(100),
  note: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const parsed = progressSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const [entry] = await db.$transaction([
    db.goalProgress.create({
      data: { goalId: id, value: parsed.data.value, note: parsed.data.note },
    }),
    // keep the goal's headline progress and status in sync automatically
    db.goal.update({
      where: { id },
      data: {
        progress: parsed.data.value,
        ...(parsed.data.value >= 100
          ? { status: "ACHIEVED" }
          : { status: "IN_PROGRESS" }),
      },
    }),
  ]);
  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Goal",
    entityId: id,
    meta: { progress: parsed.data.value },
  });
  return NextResponse.json(entry, { status: 201 });
}
