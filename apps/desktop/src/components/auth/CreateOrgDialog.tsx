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
import {
  createOrganization,
  setActiveOrganization,
  type Organization,
} from "../../lib/orgs";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (org: Organization) => void;
}

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function CreateOrgDialog({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [touchedSlug, setTouchedSlug] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-sync slug from name until the user customises it.
  useEffect(() => {
    if (!touchedSlug) setSlug(slugify(name));
  }, [name, touchedSlug]);

  // Reset on close.
  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setTouchedSlug(false);
      setError(null);
      setBusy(false);
    }
  }, [open]);

  const valid = name.trim().length >= 2 && SLUG_RE.test(slug);

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      const org = await createOrganization({ name: name.trim(), slug });
      await setActiveOrganization(org.id);
      onCreated(org);
      onOpenChange(false);
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
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Organizations let you collaborate on streams with your team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field
            label="Name"
            value={name}
            onChange={setName}
            placeholder="My Church"
            autoFocus
          />
          <Field
            label="URL slug"
            value={slug}
            onChange={(v) => {
              setSlug(v);
              setTouchedSlug(true);
            }}
            placeholder="my-church"
            hint="Lowercase letters, numbers, hyphens. Used in invite links."
          />

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!valid || busy}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            {busy ? "Creating…" : "Create organization"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <input
        autoFocus={autoFocus}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-red-500/60"
      />
      {hint && <p className="mt-1 text-[11px] text-zinc-600">{hint}</p>}
    </label>
  );
}
