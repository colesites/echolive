import { Resend } from "resend";

declare const process: { env: Record<string, string | undefined> };

// Lazy singleton — we don't want to fail Convex deploys if the key is
// not yet configured (Phase 1 lets users sign up with Google only).
let client: Resend | null = null;
function resend(): Resend {
  if (!client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error(
        "RESEND_API_KEY is not set. Configure it in the Convex dashboard before sending email.",
      );
    }
    client = new Resend(key);
  }
  return client;
}

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? "Echo Live <noreply@echolive.app>";
}

export async function sendPasswordResetEmail(args: {
  to: string;
  url: string;
}): Promise<void> {
  await resend().emails.send({
    from: fromAddress(),
    to: args.to,
    subject: "Reset your Echo Live password",
    text: `Click the link below to reset your password. If you didn't ask for this, ignore this email.\n\n${args.url}\n`,
    html: `<p>Click the link below to reset your password. If you didn't ask for this, ignore this email.</p>
<p><a href="${args.url}">Reset password</a></p>`,
  });
}

export async function sendVerificationEmail(args: {
  to: string;
  url: string;
}): Promise<void> {
  await resend().emails.send({
    from: fromAddress(),
    to: args.to,
    subject: "Verify your email for Echo Live",
    text: `Verify your email by clicking:\n\n${args.url}\n`,
    html: `<p>Verify your email by clicking the link below:</p>
<p><a href="${args.url}">Verify email</a></p>`,
  });
}
