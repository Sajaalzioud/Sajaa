import { db } from "@/lib/db";
import { enumLabel, formatCurrency, formatDate, fullName } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecordPaymentButton } from "@/components/billing/record-payment";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  PAID: "success",
  SENT: "secondary",
  PARTIALLY_PAID: "warning",
  OVERDUE: "destructive",
  DRAFT: "secondary",
  VOID: "secondary",
};

export default async function BillingPage() {
  const invoices = await db.invoice.findMany({
    orderBy: { issueDate: "desc" },
    include: { patient: true, payments: true },
  });

  const collected = invoices.reduce(
    (s, i) => s + i.payments.reduce((x, p) => x + Number(p.amount), 0),
    0,
  );
  const outstanding = invoices
    .filter((i) => !["PAID", "VOID", "DRAFT"].includes(i.status))
    .reduce(
      (s, i) =>
        s + Number(i.total) - i.payments.reduce((x, p) => x + Number(p.amount), 0),
      0,
    );
  const overdue = invoices.filter((i) => i.status === "OVERDUE").length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Billing"
        description="Invoices, payments and financial overview"
      />

      <div className="grid grid-cols-3 gap-4">
        {(
          [
            ["Collected", formatCurrency(collected)],
            ["Outstanding", formatCurrency(outstanding)],
            ["Overdue invoices", String(overdue)],
          ] as const
        ).map(([label, value]) => (
          <Card key={label}>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">{value}</div>
              <div className="text-muted-foreground text-xs">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => {
              const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.number}</TableCell>
                  <TableCell>{fullName(inv.patient)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(inv.issueDate)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatCurrency(Number(inv.total))}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatCurrency(paid)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[inv.status]}>
                      {enumLabel(inv.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!["PAID", "VOID"].includes(inv.status) && (
                      <RecordPaymentButton
                        invoiceId={inv.id}
                        remaining={Number(inv.total) - paid}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
