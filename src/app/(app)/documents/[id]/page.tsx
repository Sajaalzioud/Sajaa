import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { DOC_DEFINITIONS } from "@/lib/documents/definitions";
import { formatAge, formatDateTime, fullName } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { DocumentEditor } from "@/components/documents/document-editor";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await db.document.findUnique({
    where: { id },
    include: { patient: true, therapist: true, signedBy: true },
  });
  if (!document) notFound();

  const def = DOC_DEFINITIONS[document.type];
  const patientContext = [
    `age ${formatAge(document.patient.dob)}`,
    document.patient.diagnoses.length
      ? `diagnoses: ${document.patient.diagnoses.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("; ");

  return (
    <div className="animate-fade-up mx-auto max-w-3xl">
      <PageHeader
        title={def.label}
        description={
          <>
            <Link
              href={`/patients/${document.patientId}`}
              className="text-primary hover:underline"
            >
              {fullName(document.patient)}
            </Link>{" "}
            · {formatAge(document.patient.dob)} · by {document.therapist.name}
            {document.signedAt && document.signedBy && (
              <>
                {" "}
                · signed by {document.signedBy.name} on{" "}
                {formatDateTime(document.signedAt)}
              </>
            )}
          </>
        }
      />
      <DocumentEditor
        documentId={document.id}
        docType={document.type}
        status={document.status}
        sections={def.sections}
        initialTitle={document.title}
        initialContent={(document.content as Record<string, string>) ?? {}}
        initialSessionDate={format(document.sessionDate, "yyyy-MM-dd")}
        patientContext={patientContext}
      />
    </div>
  );
}
