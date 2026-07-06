import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.enum(["CASH", "CARD", "TRANSFER", "INSURANCE"]),
  reference: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const parsed = paymentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { payments: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const paidSoFar = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
  const newTotal = paidSoFar + parsed.data.amount;
  const status = newTotal >= Number(invoice.total) ? "PAID" : "PARTIALLY_PAID";

  const [payment] = await db.$transaction([
    db.payment.create({ data: { invoiceId: id, ...parsed.data } }),
    db.invoice.update({ where: { id }, data: { status } }),
  ]);
  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "Payment",
    entityId: payment.id,
    meta: { invoiceId: id, amount: parsed.data.amount },
  });
  return NextResponse.json(payment, { status: 201 });
}
