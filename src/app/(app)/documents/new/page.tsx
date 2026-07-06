import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { NewDocumentForm } from "@/components/documents/new-document-form";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string; type?: string }>;
}) {
  const { patientId, type } = await searchParams;
  const patients = await db.patient.findMany({
    where: { status: { in: ["ACTIVE", "WAITLIST"] } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true, mrn: true },
  });

  return (
    <div className="animate-fade-up mx-auto max-w-2xl">
      <PageHeader
        title="New Document"
        description="Choose a patient and a document type — the editor opens with the right sections."
      />
      <NewDocumentForm
        patients={patients}
        initialPatientId={patientId}
        initialType={type}
      />
    </div>
  );
}
