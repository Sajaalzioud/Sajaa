import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatAge, fullName } from "@/lib/utils";
import type {
  ComputedScores,
  Responses,
  TemplateSchema,
} from "@/lib/assessment/types";
import { PageHeader } from "@/components/page-header";
import { AssessmentRunner } from "@/components/assessments/assessment-runner";

export const dynamic = "force-dynamic";

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = await db.assessment.findUnique({
    where: { id },
    include: { template: true, patient: true, therapist: true },
  });
  if (!assessment) notFound();

  return (
    <div className="animate-fade-up mx-auto max-w-3xl">
      <PageHeader
        title={assessment.template.name}
        description={
          <>
            <Link
              href={`/patients/${assessment.patientId}`}
              className="text-primary hover:underline"
            >
              {fullName(assessment.patient)}
            </Link>{" "}
            · {formatAge(assessment.patient.dob)} · administered by{" "}
            {assessment.therapist.name}
          </>
        }
      />
      <AssessmentRunner
        assessmentId={assessment.id}
        templateName={assessment.template.name}
        patientName={fullName(assessment.patient)}
        schema={assessment.template.schema as unknown as TemplateSchema}
        status={assessment.status}
        initialResponses={assessment.responses as Responses}
        initialNotes={assessment.notes ?? ""}
        scores={(assessment.scores as unknown as ComputedScores) ?? null}
        interpretation={assessment.interpretation}
      />
    </div>
  );
}
