import sendEmail from "@/actions/send-email";
import prisma from "@/lib/prisma";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin, openAPI } from "better-auth/plugins"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),

    socialProviders: {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID as string,
          clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        // BUG: Prob a bug with updateAge method. It throws an error - Argument `where` of type SessionWhereUniqueInput needs at least one of `id` arguments. 
        // As a workaround, set updateAge to a large value for now.
        updateAge: 60 * 60 * 24 * 7, // 7 days (every 7 days the session expiration is updated)
        cookieCache: {
          enabled: true,
          maxAge: 5 * 60 // Cache duration in seconds
        }
    },

    user: {
        additionalFields: {
          premium: {
            type: "boolean",
            required: false,
          },
        },
        changeEmail: {
          enabled: true,
          sendChangeEmailVerification: async ({ newEmail, url }) => {
            await sendEmail({
              to: newEmail,
              subject: 'Verify your email change',
              text: `Click the link to verify: ${url}`
            })
          }
        }
      }, 

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
              to: user.email,
              subject: "Reset your password",
              text: `Click the link to reset your password: ${url}`,
            });
        },
    },

    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, token }) => {
            const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;
            await sendEmail ({
              to: user.email,
              subject: "Verify your email address",
              text: `Click the link to verify your email: ${verificationUrl}`,
            });
        }
    },

    plugins: [openAPI(), admin({
        impersonationSessionDuration: 60 * 60 * 24 * 7, // 7 days
    })],
} satisfies BetterAuthOptions)

export type Session = typeof auth.$Infer.Session;