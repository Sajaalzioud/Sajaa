import { PageHeader } from "@/components/page-header";
import { TemplateBuilder } from "@/components/assessments/template-builder";

export default function NewTemplatePage() {
  return (
    <div className="animate-fade-up mx-auto max-w-4xl">
      <PageHeader
        title="New Assessment Template"
        description="Build a custom assessment with sections, items, scoring and automatic interpretation."
      />
      <TemplateBuilder />
    </div>
  );
}
