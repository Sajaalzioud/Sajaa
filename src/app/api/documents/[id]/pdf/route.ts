import { NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { DOC_DEFINITIONS } from "@/lib/documents/definitions";
import { formatAge, fullName } from "@/lib/utils";
import { DocumentPdf } from "@/lib/pdf/document-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [document, clinic] = await Promise.all([
    db.document.findUnique({
      where: { id },
      include: { patient: true, therapist: true, signedBy: true },
    }),
    db.clinicSettings.findFirst(),
  ]);
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const element = createElement(DocumentPdf, {
    input: {
      clinic: {
        name: clinic?.name ?? "Sajaa Pediatric Therapy",
        brandColor: clinic?.brandColor ?? "#0d9488",
        address: clinic?.address,
        phone: clinic?.phone,
        email: clinic?.email,
      },
      definition: DOC_DEFINITIONS[document.type],
      title: document.title,
      sessionDate: document.sessionDate,
      content: (document.content as Record<string, string>) ?? {},
      patient: {
        name: fullName(document.patient),
        mrn: document.patient.mrn,
        dob: document.patient.dob,
        age: formatAge(document.patient.dob, document.sessionDate),
        diagnoses: document.patient.diagnoses,
        physician: document.patient.physician,
      },
      therapist: {
        name: document.therapist.name,
        title: document.therapist.title,
        licenseNumber: document.therapist.licenseNumber,
      },
      signedAt: document.signedAt,
      signedBy: document.signedBy?.name ?? null,
    },
  }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  await audit({
    userId: user.id,
    action: "EXPORT",
    entityType: "Document",
    entityId: id,
    meta: { format: "pdf" },
  });

  const filename = `${document.title.replace(/[^\w\d-]+/g, "-")}.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
