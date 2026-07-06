import Link from "next/link";
import { FileTextIcon, PlusIcon } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { DOC_DEFINITIONS, DOC_TYPES } from "@/lib/documents/definitions";
import { enumLabel, formatDate, fullName } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentsToolbar } from "@/components/documents/documents-toolbar";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; status?: string }>;
}) {
  const { q, type, status } = await searchParams;
  const where: Prisma.DocumentWhereInput = {};
  if (q) where.title = { contains: q, mode: "insensitive" };
  if (type && DOC_TYPES.includes(type as (typeof DOC_TYPES)[number])) {
    where.type = type as (typeof DOC_TYPES)[number];
  }
  if (status && status !== "ALL") {
    where.status = status as Prisma.DocumentWhereInput["status"];
  }

  const documents = await db.document.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { patient: true, therapist: true },
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Documents"
        description="All clinical documentation across patients"
      >
        <Button asChild>
          <Link href="/documents/new">
            <PlusIcon /> New Document
          </Link>
        </Button>
      </PageHeader>

      <DocumentsToolbar />

      <Card className="mt-4 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Session date</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                  No documents found.
                </TableCell>
              </TableRow>
            )}
            {documents.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <Link href={`/documents/${d.id}`} className="flex items-center gap-2 font-medium hover:underline">
                    <FileTextIcon className="text-primary size-4" />
                    {d.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/patients/${d.patientId}`} className="hover:underline">
                    {fullName(d.patient)}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {DOC_DEFINITIONS[d.type].label}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(d.sessionDate)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {d.therapist.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      d.status === "SIGNED"
                        ? "success"
                        : d.status === "DRAFT"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {enumLabel(d.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
