import { cache } from "react";
import { db } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

/**
 * Authentication boundary.
 *
 * In production this resolves the signed-in Supabase user (via
 * `@supabase/ssr` cookie helpers) and maps `auth.users.id` -> `User.authId`.
 * In local development — where no Supabase project exists — it resolves the
 * seeded clinic therapist so every feature is exercisable end-to-end.
 *
 * All server code MUST obtain the current user through this module so the
 * Supabase swap is a one-file change. See docs/ARCHITECTURE.md § Auth.
 */
export const getCurrentUser = cache(async (): Promise<User> => {
  // TODO(supabase): const supabaseUser = await getSupabaseUser(cookies());
  const user = await db.user.findFirst({
    where: { role: "THERAPIST", isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!user) {
    throw new Error(
      "No user found. Run `npm run db:seed` to create the demo clinic.",
    );
  }
  return user;
});

export type SessionUser = User;
