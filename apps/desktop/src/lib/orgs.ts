import { getAuthToken } from "./session";

/**
 * Thin wrapper around Better Auth's `/api/auth/organization/*` HTTP
 * endpoints. We don't use the React `authClient` here because the
 * desktop's authClient doesn't have a cookie store — instead each call
 * sends the persisted bearer token via the `Authorization` header.
 *
 * The bearer is the Better Auth session token (NOT the Convex JWT) —
 * see `lib/session.ts` for the two-token model.
 */

const AUTH_BASE = (import.meta.env.VITE_CONVEX_SITE_URL as string).replace(
  /\/$/,
  "",
);
const ACTIVE_ORG_KEY = "echolive:activeOrgId";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  expiresAt: string;
  inviterId: string;
}

async function call<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const token = getAuthToken();
  if (!token) throw new Error("Not signed in.");
  const { json, ...rest } = init;
  const res = await fetch(`${AUTH_BASE}/api/auth${path}`, {
    ...rest,
    headers: {
      ...(rest.headers ?? {}),
      Authorization: `Bearer ${token}`,
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${path} → ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

// ───── Active org (cached locally) ─────

export function getActiveOrgId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_ORG_KEY);
}

export function setActiveOrgId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(ACTIVE_ORG_KEY, id);
  else window.localStorage.removeItem(ACTIVE_ORG_KEY);
}

// ───── Org endpoints ─────

export function listMyOrganizations(): Promise<Organization[]> {
  return call<Organization[]>("/organization/list");
}

export function createOrganization(args: {
  name: string;
  slug: string;
}): Promise<Organization> {
  return call<Organization>("/organization/create", {
    method: "POST",
    json: args,
  });
}

export async function setActiveOrganization(
  organizationId: string,
): Promise<void> {
  await call("/organization/set-active", {
    method: "POST",
    json: { organizationId },
  });
  setActiveOrgId(organizationId);
}

export async function clearActiveOrganization(): Promise<void> {
  await call("/organization/set-active", {
    method: "POST",
    json: { organizationId: null },
  });
  setActiveOrgId(null);
}

export function listMembers(args: {
  organizationId: string;
}): Promise<{ members: Member[] }> {
  const params = new URLSearchParams({ organizationId: args.organizationId });
  return call<{ members: Member[] }>(`/organization/list-members?${params}`);
}

export function listInvitations(args: {
  organizationId: string;
}): Promise<{ invitations: Invitation[] }> {
  const params = new URLSearchParams({ organizationId: args.organizationId });
  return call<{ invitations: Invitation[] }>(
    `/organization/list-invitations?${params}`,
  );
}

export function inviteMember(args: {
  organizationId: string;
  email: string;
  role: "owner" | "admin" | "member";
}): Promise<Invitation> {
  return call<Invitation>("/organization/invite-member", {
    method: "POST",
    json: args,
  });
}

export function cancelInvitation(invitationId: string): Promise<void> {
  return call("/organization/cancel-invitation", {
    method: "POST",
    json: { invitationId },
  });
}

export function removeMember(args: {
  memberIdOrEmail: string;
  organizationId: string;
}): Promise<void> {
  return call("/organization/remove-member", {
    method: "POST",
    json: args,
  });
}

export function updateMemberRole(args: {
  memberId: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
}): Promise<Member> {
  return call<Member>("/organization/update-member-role", {
    method: "POST",
    json: args,
  });
}
