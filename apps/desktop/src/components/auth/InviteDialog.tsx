"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { inviteMember } from "../../lib/orgs";

type Role = "owner" | "admin" | "member";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
  onInvited?: () => void;
}

export function InviteDialog({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  onInvited,
}: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("member");
      setBusy(false);
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const submit = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await inviteMember({ organizationId, email: trimmed, role });
      setSuccess(`Invitation sent to ${trimmed}.`);
      setEmail("");
      onInvited?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] border-zinc-800 bg-zinc-950">
        <DialogHeader>
          <DialogTitle>Invite to {organizationName}</DialogTitle>
          <DialogDescription>
            They&rsquo;ll receive an email with a link to join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              autoFocus
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-red-500/60"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Role
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-red-500/60"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </label>

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              {success}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={submit}
            disabled={!email.trim() || busy}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            {busy ? "Sending…" : "Send invitation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
