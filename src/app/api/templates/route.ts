import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { templatePayload } from "@/lib/validators/template";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const parsed = templatePayload.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const template = await db.assessmentTemplate.create({
    data: { ...parsed.data, createdById: user.id },
  });
  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "AssessmentTemplate",
    entityId: template.id,
  });
  return NextResponse.json(template, { status: 201 });
}
