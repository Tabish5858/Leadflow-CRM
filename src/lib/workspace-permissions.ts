/**
 * Checks whether a given email is allowed to create workspaces.
 * Only emails listed in NEXT_PUBLIC_ALLOWED_WORKSPACE_CREATORS can create.
 *
 * The env var is a comma-separated list of emails.
 * Whitespace around each email is trimmed automatically.
 * If the env var is empty or not set, no one can create workspaces.
 */
export function canCreateWorkspace(email: string | null | undefined): boolean {
  if (!email) return false;

  const raw = process.env.NEXT_PUBLIC_ALLOWED_WORKSPACE_CREATORS;

  if (!raw) return false;

  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email.toLowerCase());
}
