import { notFound } from "next/navigation";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { fullName } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { PatientForm } from "@/components/patients/patient-form";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await db.patient.findUnique({
    where: { id },
    include: { contacts: true },
  });
  if (!patient) notFound();

  return (
    <div className="animate-fade-up mx-auto max-w-4xl">
      <PageHeader title={`Edit ${fullName(patient)}`} description={patient.mrn} />
      <PatientForm
        patientId={patient.id}
        defaultValues={{
          firstName: patient.firstName,
          lastName: patient.lastName,
          dob: format(patient.dob, "yyyy-MM-dd"),
          gender: patient.gender,
          nationality: patient.nationality ?? "",
          status: patient.status,
          school: patient.school ?? "",
          grade: patient.grade ?? "",
          diagnoses: patient.diagnoses,
          referralSource: patient.referralSource ?? "",
          physician: patient.physician ?? "",
          insuranceProvider: patient.insuranceProvider ?? "",
          insuranceNumber: patient.insuranceNumber ?? "",
          allergies: patient.allergies ?? "",
          medications: patient.medications ?? "",
          medicalHistory: patient.medicalHistory ?? "",
          developmentalHistory: patient.developmentalHistory ?? "",
          birthHistory: patient.birthHistory ?? "",
          familyHistory: patient.familyHistory ?? "",
          previousTherapies: patient.previousTherapies ?? "",
          contacts: patient.contacts.map((c) => ({
            name: c.name,
            relationship: c.relationship,
            phone: c.phone ?? "",
            altPhone: c.altPhone ?? "",
            email: c.email ?? "",
            isPrimary: c.isPrimary,
            isEmergency: c.isEmergency,
          })),
        }}
      />
    </div>
  );
}
