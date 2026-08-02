import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export type Role = "USER" | "MERCHANT" | "ADMIN";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
}

/**
 * Fetch the authenticated user session from headers (Server Side)
 */
export async function getAuthSession() {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });
    return session;
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return null;
  }
}

/**
 * Fetch current user object with updated database role
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await getAuthSession();
  if (!session?.user?.id) return null;

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (!dbUser) return null;

  return {
    ...dbUser,
    role: (dbUser.role as Role) || "USER",
  };
}

/**
 * Ensure user is logged in and possesses one of the allowed roles.
 * Redirects to /login or homepage if unauthenticated or unauthorized.
 */
export async function requireRole(allowedRoles: Role[]): Promise<AppUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") redirect("/admin");
    redirect("/");
  }

  return user;
}

export function isAdmin(user: AppUser | null): boolean {
  return user?.role === "ADMIN";
}

export function isMerchant(user: AppUser | null): boolean {
  return user?.role === "MERCHANT" || user?.role === "ADMIN";
}
