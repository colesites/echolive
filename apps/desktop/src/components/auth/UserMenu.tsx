"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Check,
  LogOut,
  Plus,
  Settings,
  UserCircle,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOut } from "../../lib/authClient";
import { convex } from "../../lib/convex";
import {
  clearTokens,
  loadTokens,
  onTokenChange,
} from "../../lib/session";
import {
  getActiveOrgId,
  listMyOrganizations,
  setActiveOrganization,
  type Organization,
} from "../../lib/orgs";
import { api } from "@backend/convex/_generated/api";
import { useStudioStore } from "../../store/studioStore";
import { CreateOrgDialog } from "./CreateOrgDialog";
import { InviteDialog } from "./InviteDialog";

interface Profile {
  name: string | null;
  email: string | null;
  imageUrl: string | null;
}

/**
 * Sidebar header. Renders one of three states:
 *
 *   1. Unauthenticated → brand mark.
 *   2. Authenticated, no active org → user name + dropdown with orgs list.
 *   3. Authenticated + active org → org name + dropdown with member tools.
 *
 * The dropdown is also the only place to sign out — the topbar
 * SignInButton hides while authed.
 */
export function UserMenu({ collapsed }: { collapsed: boolean }) {
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const refresh = useCallback(async () => {
    const tokens = await loadTokens();
    setAuthed(!!tokens.convexJwt);
    if (!tokens.convexJwt) {
      setProfile(null);
      setOrgs([]);
      setActiveId(null);
      return;
    }
    const [p, o] = await Promise.all([fetchProfile(), fetchOrgs()]);
    setProfile(p);
    setOrgs(o);
    setActiveId(getActiveOrgId());
  }, []);

  useEffect(() => {
    void refresh();
    return onTokenChange(() => {
      void refresh();
    });
  }, [refresh]);

  if (!authed) return <BrandMark collapsed={collapsed} />;

  const activeOrg = orgs.find((o) => o.id === activeId) ?? null;

  // Display state: org name when in an org context, else user name.
  const displayName = activeOrg?.name ?? profile?.name ?? profile?.email ?? "";
  const initials = activeOrg
    ? deriveInitials(activeOrg.name)
    : deriveInitials(profile?.name ?? profile?.email ?? "?");

  const switchTo = async (orgId: string | null) => {
    try {
      if (orgId) await setActiveOrganization(orgId);
      else {
        const { clearActiveOrganization } = await import("../../lib/orgs");
        await clearActiveOrganization();
      }
      setActiveId(orgId);
    } catch (err) {
      console.error("[echolive] switch org failed:", err);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-zinc-800/40"
            aria-label="Account menu"
          >
            <Avatar
              imageUrl={activeOrg ? null : profile?.imageUrl}
              initials={initials}
              isOrg={!!activeOrg}
            />
            <span
              className="ml-1 min-w-0 flex-1 truncate text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              title={displayName}
            >
              {displayName}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-72"
        >
          <DropdownMenuLabel className="flex items-center gap-2 py-2">
            <Avatar
              imageUrl={profile?.imageUrl}
              initials={deriveInitials(profile?.name ?? profile?.email ?? "?")}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">
                {profile?.name ?? "Signed in"}
              </p>
              {profile?.email && (
                <p className="truncate text-xs text-zinc-500">{profile.email}</p>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Org switcher */}
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">
            Organizations
          </DropdownMenuLabel>

          <DropdownMenuItem onSelect={() => void switchTo(null)}>
            <UserCircle className="h-4 w-4" />
            <span className="flex-1">Personal account</span>
            {activeId === null && <Check className="h-3.5 w-3.5 text-red-400" />}
          </DropdownMenuItem>

          {orgs.map((o) => (
            <DropdownMenuItem
              key={o.id}
              onSelect={() => void switchTo(o.id)}
              title={o.slug}
            >
              <Building2 className="h-4 w-4" />
              <span className="flex-1 truncate">{o.name}</span>
              {activeId === o.id && (
                <Check className="h-3.5 w-3.5 text-red-400" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create organization
          </DropdownMenuItem>

          {activeOrg && (
            <DropdownMenuItem onSelect={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Invite to {activeOrg.name}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {activeOrg && (
            <DropdownMenuItem
              onSelect={() =>
                useStudioStore.getState().setActiveView("organization")
              }
            >
              <Settings className="h-4 w-4" />
              Manage organization
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            danger
            onSelect={async () => {
              await signOut().catch(() => {});
              await clearTokens();
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrgDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(org) => {
          setOrgs((prev) => [...prev, org]);
          setActiveId(org.id);
        }}
      />

      {activeOrg && (
        <InviteDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          organizationId={activeOrg.id}
          organizationName={activeOrg.name}
        />
      )}
    </>
  );
}

function BrandMark({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex w-full items-center gap-3 px-1">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
        <span className="text-sm font-bold text-white">EL</span>
      </div>
      <span
        className={
          collapsed
            ? "ml-1 text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
            : "ml-1 text-lg font-bold whitespace-nowrap"
        }
      >
        Echo Live
      </span>
    </div>
  );
}

function Avatar({
  imageUrl,
  initials,
  size = "md",
  isOrg = false,
}: {
  imageUrl: string | null | undefined;
  initials: string;
  size?: "sm" | "md";
  isOrg?: boolean;
}) {
  const dim = size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs";
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={`${dim} shrink-0 rounded-full object-cover ring-1 ring-zinc-800`}
      />
    );
  }
  const gradient = isOrg
    ? "from-zinc-700 to-zinc-900"
    : "from-red-500 to-red-700";
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-${isOrg ? "lg" : "full"} bg-gradient-to-br ${gradient} font-bold text-white ring-1 ring-zinc-800`}
    >
      {initials}
    </div>
  );
}

function deriveInitials(source: string): string {
  const parts = source.split(/[\s@]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

async function fetchProfile(): Promise<Profile | null> {
  try {
    const user = (await convex.query(api.auth.getCurrentUser, {})) as
      | { name?: string | null; email?: string | null; image?: string | null }
      | null
      | undefined;
    if (!user) return null;
    return {
      name: user.name ?? null,
      email: user.email ?? null,
      imageUrl: user.image ?? null,
    };
  } catch (err) {
    console.warn("[echolive] fetchProfile failed:", err);
    return null;
  }
}

async function fetchOrgs(): Promise<Organization[]> {
  try {
    return await listMyOrganizations();
  } catch (err) {
    console.warn("[echolive] fetchOrgs failed:", err);
    return [];
  }
}

