import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { enumLabel, formatAge, fullName, initials } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PatientsToolbar } from "@/components/patients/patients-toolbar";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  ACTIVE: "success",
  WAITLIST: "warning",
  INACTIVE: "secondary",
  DISCHARGED: "secondary",
};

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const where: Prisma.PatientWhereInput = {};
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { mrn: { contains: q, mode: "insensitive" } },
      { diagnoses: { hasSome: [q] } },
    ];
  }
  if (status && status !== "ALL") {
    where.status = status as Prisma.PatientWhereInput["status"];
  }

  const patients = await db.patient.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      primaryTherapist: true,
      _count: { select: { documents: true, assessments: true } },
    },
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Patients"
        description={`${patients.length} patient${patients.length === 1 ? "" : "s"}`}
      >
        <Button asChild>
          <Link href="/patients/new">
            <PlusIcon /> New Patient
          </Link>
        </Button>
      </PageHeader>

      <PatientsToolbar />

      <Card className="mt-4 py-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Diagnoses</TableHead>
              <TableHead>Therapist</TableHead>
              <TableHead>Docs</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                  No patients found.
                </TableCell>
              </TableRow>
            )}
            {patients.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link
                    href={`/patients/${p.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback>{initials(fullName(p))}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium hover:underline">{fullName(p)}</div>
                      <div className="text-muted-foreground text-xs">{p.mrn}</div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>{formatAge(p.dob)}</TableCell>
                <TableCell>
                  <div className="flex max-w-64 flex-wrap gap-1">
                    {p.diagnoses.slice(0, 2).map((d) => (
                      <Badge key={d} variant="secondary" className="whitespace-normal">
                        {d}
                      </Badge>
                    ))}
                    {p.diagnoses.length > 2 && (
                      <Badge variant="outline">+{p.diagnoses.length - 2}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.primaryTherapist?.name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p._count.documents}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[p.status]}>{enumLabel(p.status)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
