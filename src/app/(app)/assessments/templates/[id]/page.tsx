import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { ScoringConfig, TemplateSchema } from "@/lib/assessment/types";
import { PageHeader } from "@/components/page-header";
import { TemplateBuilder } from "@/components/assessments/template-builder";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await db.assessmentTemplate.findUnique({
    where: { id },
    include: { _count: { select: { assessments: true } } },
  });
  if (!template) notFound();

  return (
    <div className="animate-fade-up mx-auto max-w-4xl">
      <PageHeader
        title={`Edit: ${template.name}`}
        description={
          template._count.assessments > 0
            ? `v${template.version} · in use by ${template._count.assessments} assessment(s) — saving creates a new version`
            : `v${template.version} · not yet administered — edits apply in place`
        }
      />
      <TemplateBuilder
        templateId={template.id}
        initial={{
          name: template.name,
          abbreviation: template.abbreviation ?? "",
          category: template.category,
          description: template.description ?? "",
          isStandardized: template.isStandardized,
          schema: template.schema as unknown as TemplateSchema,
          scoring: template.scoring as unknown as ScoringConfig,
        }}
      />
    </div>
  );
}
