import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { templatePayload } from "@/lib/validators/template";

type Params = { params: Promise<{ id: string }> };

/**
 * Version-controlled template update: if any assessment has been administered
 * with this version, the update creates a NEW version (old row is retired but
 * kept so historical assessments render exactly as scored). Otherwise the row
 * is updated in place.
 */
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();
  const parsed = templatePayload.partial().safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const existing = await db.assessmentTemplate.findUnique({
    where: { id },
    include: { _count: { select: { assessments: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let template;
  if (existing._count.assessments > 0) {
    const [, created] = await db.$transaction([
      db.assessmentTemplate.update({
        where: { id },
        data: { isActive: false },
      }),
      db.assessmentTemplate.create({
        data: {
          name: parsed.data.name ?? existing.name,
          abbreviation: parsed.data.abbreviation ?? existing.abbreviation,
          category: parsed.data.category ?? existing.category,
          description: parsed.data.description ?? existing.description,
          ageMinMonths: parsed.data.ageMinMonths ?? existing.ageMinMonths,
          ageMaxMonths: parsed.data.ageMaxMonths ?? existing.ageMaxMonths,
          isStandardized: parsed.data.isStandardized ?? existing.isStandardized,
          schema: (parsed.data.schema ?? existing.schema) as object,
          scoring: (parsed.data.scoring ?? existing.scoring) as object,
          version: existing.version + 1,
          parentTemplateId: existing.id,
          createdById: user.id,
        },
      }),
    ]);
    template = created;
  } else {
    template = await db.assessmentTemplate.update({
      where: { id },
      data: {
        ...parsed.data,
        schema: parsed.data.schema as object | undefined,
        scoring: parsed.data.scoring as object | undefined,
      },
    });
  }

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "AssessmentTemplate",
    entityId: template.id,
    meta: { versioned: existing._count.assessments > 0 },
  });
  return NextResponse.json(template);
}

/** Duplicate a template as a new independent draft. */
export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();
  const existing = await db.assessmentTemplate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const copy = await db.assessmentTemplate.create({
    data: {
      name: `${existing.name} (Copy)`,
      abbreviation: existing.abbreviation,
      category: existing.category,
      description: existing.description,
      ageMinMonths: existing.ageMinMonths,
      ageMaxMonths: existing.ageMaxMonths,
      isStandardized: false,
      schema: existing.schema as object,
      scoring: existing.scoring as object,
      createdById: user.id,
    },
  });
  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "AssessmentTemplate",
    entityId: copy.id,
    meta: { duplicatedFrom: id },
  });
  return NextResponse.json(copy, { status: 201 });
}
