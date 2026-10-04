import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "USER" },
      ageRange: { type: "string", required: false },
      isMinor: { type: "boolean", defaultValue: false },
      // Phase 5 safeguarding: stored at signup for 16–17, never exposed to client logs.
      guardianConsent: { type: "boolean", defaultValue: false },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7 },
});
