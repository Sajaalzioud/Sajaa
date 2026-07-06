import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.record(z.string(), z.string()).optional(),
  sessionDate: z.string().optional(),
  action: z.enum(["complete", "sign", "reopen"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const { action, sessionDate, ...data } = parsed.data;

  const existing = await db.document.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // A signed document is immutable; it can only be amended, which reopens it
  // as an AMENDED draft while keeping the audit trail.
  if (existing.status === "SIGNED" && action !== "reopen") {
    return NextResponse.json(
      { error: "Signed documents cannot be edited. Reopen to amend." },
      { status: 409 },
    );
  }

  let extra = {};
  if (action === "complete") extra = { status: "COMPLETED" };
  else if (action === "sign")
    extra = { status: "SIGNED", signedAt: new Date(), signedById: user.id };
  else if (action === "reopen")
    extra = { status: "AMENDED", signedAt: null, signedById: null };

  const document = await db.document.update({
    where: { id },
    data: {
      ...data,
      ...(sessionDate ? { sessionDate: new Date(sessionDate) } : {}),
      ...extra,
    },
  });
  await audit({
    userId: user.id,
    action: action === "sign" ? "SIGN" : "UPDATE",
    entityType: "Document",
    entityId: id,
    meta: action ? { action } : undefined,
  });
  return NextResponse.json(document);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  await db.document.delete({ where: { id } });
  await audit({
    userId: user.id,
    action: "DELETE",
    entityType: "Document",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
