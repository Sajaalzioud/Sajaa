import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { db } from "@/lib/db";
import { enumLabel, formatDate, fullName } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateCardActions } from "@/components/assessments/template-card-actions";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage() {
  const [templates, recent] = await Promise.all([
    db.assessmentTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: { _count: { select: { assessments: true } } },
    }),
    db.assessment.findMany({
      take: 20,
      orderBy: { updatedAt: "desc" },
      include: { template: true, patient: true, therapist: true },
    }),
  ]);

  const byCategory = new Map<string, typeof templates>();
  for (const t of templates) {
    byCategory.set(t.category, [...(byCategory.get(t.category) ?? []), t]);
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Assessments"
        description="Template library and administered assessments"
      >
        <Button asChild>
          <Link href="/assessments/templates/new">
            <PlusIcon /> New Template
          </Link>
        </Button>
      </PageHeader>

      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="recent">Administered</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="flex flex-col gap-6">
          {Array.from(byCategory.entries()).map(([category, list]) => (
            <div key={category}>
              <h2 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                {category}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((t) => (
                  <Card key={t.id} className="gap-3">
                    <CardHeader>
                      <CardTitle className="text-sm">
                        {t.name}
                        {t.abbreviation && (
                          <span className="text-muted-foreground ml-1.5 font-normal">
                            ({t.abbreviation})
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {t.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto flex items-center gap-2">
                      {t.isStandardized && (
                        <Badge variant="secondary">Standardized</Badge>
                      )}
                      <Badge variant="outline">v{t.version}</Badge>
                      <span className="text-muted-foreground text-xs">
                        {t._count.assessments} administered
                      </span>
                      <TemplateCardActions templateId={t.id} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="recent" className="flex flex-col gap-2">
          {recent.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No assessments administered yet. Start one from a patient profile.
            </p>
          )}
          {recent.map((a) => (
            <Link
              key={a.id}
              href={`/assessments/${a.id}`}
              className="hover:bg-accent flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors"
            >
              <div>
                <div className="text-sm font-medium">
                  {a.template.name} — {fullName(a.patient)}
                </div>
                <div className="text-muted-foreground text-xs">
                  {a.therapist.name} · {formatDate(a.createdAt)}
                </div>
              </div>
              <Badge variant={a.status === "COMPLETED" ? "success" : "warning"}>
                {enumLabel(a.status)}
              </Badge>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
