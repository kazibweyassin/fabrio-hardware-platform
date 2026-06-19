import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { getAppUrl, getAuthSecret } from "./env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.role === "admin") return;
          const existing = await prisma.customer.findUnique({
            where: { userId: user.id },
          });
          if (!existing) {
            await prisma.customer.create({
              data: {
                userId: user.id,
                businessName: user.name || undefined,
                creditLimit: 50000,
              },
            });
          }
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
    },
  },
  baseURL: getAppUrl(),
  trustedOrigins: [getAppUrl()],
  appName: "Fabrio Hardware",
  secret: getAuthSecret(),
});

export type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
