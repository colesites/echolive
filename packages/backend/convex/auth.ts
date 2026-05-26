import { betterAuth } from "better-auth/minimal";
import { organization } from "better-auth/plugins/organization";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import {
  sendOrganizationInvitation,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "./lib/email";

// Convex runtime provides `process.env`; declared locally so consumers
// of this file (e.g. the desktop app's type-check) don't need node types.
declare const process: { env: Record<string, string | undefined> };

// `siteUrl` is the public origin where the web app + auth UI live (the
// Next.js app). Better Auth needs it so OAuth redirects can come back
// to the right place. Trusted as a CSRF origin.
const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

// `desktopRedirect` is the deep-link scheme registered by the Tauri
// desktop app. After a successful sign-in the auth callback can redirect
// here (e.g. `echolive://auth/callback`) so the desktop receives the
// session. Wired fully in CP2b.2.
const desktopRedirectScheme =
  process.env.DESKTOP_REDIRECT_SCHEME ?? "echolive";

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: process.env.CONVEX_SITE_URL,
    trustedOrigins: [
      siteUrl,
      // Production: deep-link scheme registered by the Tauri bundle.
      `${desktopRedirectScheme}://`,
      // Dev: loopback HTTP server in the dev binary (RFC 8252 pattern).
      // Better Auth supports glob patterns for ports.
      "http://127.0.0.1:*",
      "http://localhost:*",
    ],
    database: authComponent.adapter(ctx),

    emailAndPassword: {
      enabled: true,
      // Verification is opt-in. Without Resend wired, users can still
      // sign up — they just don't get a verification email.
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await sendPasswordResetEmail({ to: user.email, url });
      },
    },

    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendVerificationEmail({ to: user.email, url });
      },
      sendOnSignUp: true,
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },

    plugins: [
      organization({
        // Multi-org: users can belong to multiple orgs, switch via
        // `setActive`. Roles default to owner/admin/member.
        allowUserToCreateOrganization: true,
        organizationLimit: 10,
        membershipLimit: 100,
        sendInvitationEmail: async ({ id, email, organization, inviter }) => {
          const url = `${siteUrl}/auth/accept-invite/${id}`;
          await sendOrganizationInvitation({
            to: email,
            inviterName: inviter.user.name ?? inviter.user.email,
            organizationName: organization.name,
            url,
          });
        },
      }),
      crossDomain({ siteUrl }),
      convex({ authConfig }),
    ],
  });

/**
 * Resolve the current authenticated Better Auth user, or `null` for
 * anonymous callers. All Convex functions should call this rather than
 * `ctx.auth.getUserIdentity()` directly — Better Auth wraps the JWT
 * with extra session lookups.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => authComponent.safeGetAuthUser(ctx),
});
