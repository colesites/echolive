"use client";

import { useEffect, useState } from "react";
import { LogOut, Settings, UserCircle, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { authClient, signOut } from "../../lib/authClient";
import { loadToken, onTokenChange, saveToken } from "../../lib/session";

interface Profile {
  name: string | null;
  email: string | null;
  imageUrl: string | null;
}

/**
 * Sidebar header that swaps between the brand mark (unauth) and an avatar
 * dropdown (authed). Single source of truth for "who am I"; the topbar
 * SignInButton only renders when there's no user, so this is the only
 * place users see their identity once signed in.
 */
export function UserMenu({ collapsed }: { collapsed: boolean }) {
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    void loadToken().then(async (token) => {
      setAuthed(!!token);
      if (token) setProfile(await fetchProfile());
    });
    return onTokenChange(async (token) => {
      setAuthed(!!token);
      setProfile(token ? await fetchProfile() : null);
    });
  }, []);

  if (!authed) return <BrandMark collapsed={collapsed} />;

  const initials = deriveInitials(profile);
  const displayName = profile?.name ?? profile?.email ?? "Signed in";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-zinc-800/40"
          aria-label="Account menu"
        >
          <Avatar imageUrl={profile?.imageUrl} initials={initials} />
          <span
            className="ml-1 min-w-0 flex-1 truncate text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            title={displayName}
          >
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="bottom" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center gap-2 py-2">
          <Avatar imageUrl={profile?.imageUrl} initials={initials} size="sm" />
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

        <DropdownMenuItem disabled>
          <UserCircle className="h-4 w-4" />
          Profile
          <span className="ml-auto text-[10px] uppercase tracking-wider text-zinc-600">
            Soon
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Building2 className="h-4 w-4" />
          Organizations
          <span className="ml-auto text-[10px] uppercase tracking-wider text-zinc-600">
            Soon
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          danger
          onSelect={async () => {
            await signOut().catch(() => {});
            await saveToken(null);
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
}: {
  imageUrl: string | null | undefined;
  initials: string;
  size?: "sm" | "md";
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
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 font-bold text-white ring-1 ring-zinc-800`}
    >
      {initials}
    </div>
  );
}

function deriveInitials(profile: Profile | null): string {
  const source = profile?.name ?? profile?.email ?? "?";
  const parts = source.split(/[\s@]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

async function fetchProfile(): Promise<Profile | null> {
  try {
    const { data } = await authClient.getSession();
    const user = data?.user;
    if (!user) return null;
    return {
      name: user.name ?? null,
      email: user.email ?? null,
      imageUrl: user.image ?? null,
    };
  } catch {
    return null;
  }
}
