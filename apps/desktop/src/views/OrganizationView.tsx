"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, UserPlus, X } from "lucide-react";
import { StudioLayout } from "../components/layout/StudioLayout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  cancelInvitation,
  getActiveOrgId,
  listInvitations,
  listMembers,
  listMyOrganizations,
  removeMember,
  updateMemberRole,
  type Invitation,
  type Member,
  type Organization,
} from "../lib/orgs";
import { InviteDialog } from "../components/auth/InviteDialog";

const ROLES = ["owner", "admin", "member"] as const;

export function OrganizationView() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const refresh = useCallback(async () => {
    const activeId = getActiveOrgId();
    if (!activeId) {
      setOrg(null);
      setMembers([]);
      setInvites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [allOrgs, m, i] = await Promise.all([
        listMyOrganizations(),
        listMembers({ organizationId: activeId }),
        listInvitations({ organizationId: activeId }),
      ]);
      setOrg(allOrgs.find((o) => o.id === activeId) ?? null);
      setMembers(m.members);
      setInvites(
        i.invitations.filter((inv) => inv.status === "pending"),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!org && !loading) {
    return (
      <StudioLayout>
        <div className="flex h-full items-center justify-center p-8">
          <Card className="max-w-md p-8 text-center">
            <h2 className="mb-2 text-lg font-semibold">
              No organization selected
            </h2>
            <p className="text-sm text-muted-foreground">
              Use the sidebar menu to create one, or switch into an existing
              org.
            </p>
          </Card>
        </div>
      </StudioLayout>
    );
  }

  return (
    <StudioLayout>
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-border px-8 py-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Organization
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              {org?.name ?? "—"}
            </h1>
            {org?.slug && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {org.slug}
              </p>
            )}
          </div>
          <Button
            onClick={() => setInviteOpen(true)}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite member
          </Button>
        </header>

        <ScrollArea className="flex-1">
          <div className="space-y-8 p-8">
            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Members ({members.length})
              </h2>
              <Card className="overflow-hidden">
                {loading && members.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    Loading…
                  </p>
                ) : members.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No members yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-900">
                    {members.map((m) => (
                      <MemberRow
                        key={m.id}
                        member={m}
                        organizationId={org!.id}
                        onChanged={refresh}
                      />
                    ))}
                  </ul>
                )}
              </Card>
            </section>

            {invites.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pending invitations ({invites.length})
                </h2>
                <Card className="overflow-hidden">
                  <ul className="divide-y divide-zinc-900">
                    {invites.map((inv) => (
                      <InviteRow
                        key={inv.id}
                        invitation={inv}
                        onChanged={refresh}
                      />
                    ))}
                  </ul>
                </Card>
              </section>
            )}
          </div>
        </ScrollArea>
      </div>

      {org && (
        <InviteDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          organizationId={org.id}
          organizationName={org.name}
          onInvited={refresh}
        />
      )}
    </StudioLayout>
  );
}

function MemberRow({
  member,
  organizationId,
  onChanged,
}: {
  member: Member;
  organizationId: string;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const changeRole = async (role: (typeof ROLES)[number]) => {
    if (role === member.role) return;
    setBusy(true);
    try {
      await updateMemberRole({ memberId: member.id, organizationId, role });
      onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Remove ${member.user.email} from the organization?`)) return;
    setBusy(true);
    try {
      await removeMember({
        memberIdOrEmail: member.id,
        organizationId,
      });
      onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800">
        {member.user.image ? (
          <img
            src={member.user.image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs font-semibold text-zinc-400">
            {(member.user.name ?? member.user.email)
              .slice(0, 2)
              .toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {member.user.name ?? member.user.email}
        </p>
        {member.user.name && (
          <p className="truncate text-xs text-muted-foreground">
            {member.user.email}
          </p>
        )}
      </div>
      <select
        value={member.role}
        onChange={(e) =>
          void changeRole(e.target.value as (typeof ROLES)[number])
        }
        disabled={busy}
        className="appearance-none rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-red-500/60 disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <Button
        variant="ghost"
        size="icon"
        onClick={remove}
        disabled={busy}
        title="Remove member"
        className="text-zinc-500 hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}

function InviteRow({
  invitation,
  onChanged,
}: {
  invitation: Invitation;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const cancel = async () => {
    setBusy(true);
    try {
      await cancelInvitation(invitation.id);
      onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800">
        <span className="text-[10px] font-semibold uppercase text-zinc-500">
          Inv
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{invitation.email}</p>
        <p className="text-xs text-muted-foreground">
          {invitation.role} · expires{" "}
          {new Date(invitation.expiresAt).toLocaleDateString()}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={cancel}
        disabled={busy}
        title="Cancel invitation"
        className="text-zinc-500 hover:text-red-400"
      >
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
}
