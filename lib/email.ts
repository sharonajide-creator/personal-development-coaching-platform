// Phase 3 — Transactional email wrapper (Resend).
// No-op with a console note when RESEND_API_KEY is absent, so local launch
// without email still works; booking confirmation falls back to in-app notice.

import { Resend } from "resend";

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log("[email:skipped] no RESEND_API_KEY", { to, subject });
    return false;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Her Purpose <hello@example.com>",
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[email:error]", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email:error]", e instanceof Error ? e.message : e);
    return false;
  }
}
