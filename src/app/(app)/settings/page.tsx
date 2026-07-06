import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClinicSettingsForm } from "@/components/settings/clinic-settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [user, clinic, auditLogs] = await Promise.all([
    getCurrentUser(),
    db.clinicSettings.findFirst(),
    db.auditLog.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
  ]);

  return (
    <div className="animate-fade-up mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Clinic branding, profile and compliance"
      />

      <div className="flex flex-col gap-5">
        <ClinicSettingsForm
          initial={{
            name: clinic?.name ?? "",
            brandColor: clinic?.brandColor ?? "#0d9488",
            address: clinic?.address ?? "",
            phone: clinic?.phone ?? "",
            email: clinic?.email ?? "",
            website: clinic?.website ?? "",
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>
              Shown on documents and PDF signature blocks.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Name:</span> {user.name}
            </div>
            <div>
              <span className="text-muted-foreground">Title:</span>{" "}
              {user.title ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span> {user.email}
            </div>
            <div>
              <span className="text-muted-foreground">License:</span>{" "}
              {user.licenseNumber ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Role:</span>{" "}
              <Badge variant="secondary">{user.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
            <CardDescription>
              Every create, update, sign and export is recorded for HIPAA-style
              accountability.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="text-muted-foreground flex flex-wrap items-center gap-2 border-b py-1.5 text-xs last:border-0"
              >
                <Badge variant="outline">{log.action}</Badge>
                <span className="text-foreground">{log.entityType}</span>
                <span>by {log.user?.name ?? "system"}</span>
                <span className="ml-auto">{formatDateTime(log.createdAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
