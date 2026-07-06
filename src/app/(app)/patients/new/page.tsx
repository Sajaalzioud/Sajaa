import { PageHeader } from "@/components/page-header";
import { PatientForm } from "@/components/patients/patient-form";

export default function NewPatientPage() {
  return (
    <div className="animate-fade-up mx-auto max-w-4xl">
      <PageHeader
        title="New Patient"
        description="Create a patient record. You can attach assessments and documents afterwards."
      />
      <PatientForm />
    </div>
  );
}
