import type { QueryCtx, MutationCtx } from "./_generated/server";

// Admin clerkIds - add your admin user IDs here
const ADMIN_CLERK_IDS: string[] = [
  // Add admin clerkIds here, e.g.:
  // "user_2abc123...",
];

// Admin emails as fallback
const ADMIN_EMAILS = [
  "anton@typebit8.com",
  "admin@typebit8.com",
];

/**
 * Get the authenticated user's identity
 * Returns null if not authenticated
 */
export async function getIdentity(ctx: QueryCtx | MutationCtx) {
  return await ctx.auth.getUserIdentity();
}

/**
 * Require authentication - throws if not authenticated
 * Returns the user identity
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  return identity;
}

/**
 * Get the authenticated user's clerkId
 * The subject field contains the Clerk user ID
 */
export async function getAuthenticatedClerkId(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuth(ctx);
  // Clerk stores the user ID in the subject field
  return identity.subject;
}

/**
 * Verify the caller is operating on their own data
 * Throws if the provided clerkId doesn't match the authenticated user
 */
export async function requireSelfOrAdmin(
  ctx: QueryCtx | MutationCtx,
  targetClerkId: string
) {
  const identity = await requireAuth(ctx);
  const callerClerkId = identity.subject;

  // Allow if operating on own data
  if (callerClerkId === targetClerkId) {
    return { identity, isAdmin: false };
  }

  // Allow if admin
  if (await isAdmin(ctx)) {
    return { identity, isAdmin: true };
  }

  throw new Error("Unauthorized: Cannot modify another user's data");
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;

  // Check by clerkId
  if (ADMIN_CLERK_IDS.includes(identity.subject)) {
    return true;
  }

  // Check by email
  if (identity.email && ADMIN_EMAILS.includes(identity.email)) {
    return true;
  }

  return false;
}

/**
 * Require admin privileges - throws if not admin
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuth(ctx);

  if (!await isAdmin(ctx)) {
    throw new Error("Admin privileges required");
  }

  return identity;
}

/**
 * Get user from database by authenticated identity
 */
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuth(ctx);
  const clerkId = identity.subject;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!user) {
    throw new Error("User not found in database");
  }

  return user;
}
