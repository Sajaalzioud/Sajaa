import { db } from "@/lib/db";

/**
 * HIPAA-style audit trail. Call from every mutating API route.
 * Failures are swallowed — an audit hiccup must never block clinical work —
 * but logged for ops visibility.
 */
export async function audit(params: {
  userId?: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "SIGN" | "EXPORT";
  entityType: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        meta: params.meta as object | undefined,
      },
    });
  } catch (err) {
    console.error("audit log write failed", err);
  }
}
