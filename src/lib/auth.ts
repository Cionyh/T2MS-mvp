
import { betterAuth } from "better-auth";
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { sendEmail } from "@/lib/sendgrid";
import { renderPasswordResetEmail } from "@/lib/email-templates";

const db = new PrismaClient();

// Only create Stripe client when key is set (avoids build failure when env is missing)
const stripeClient = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" })
  : null;

const plugins: Parameters<typeof betterAuth>[0]["plugins"] = [
    admin(),
    organization({
      async sendInvitationEmail(data) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const inviteLink = `${baseUrl}/accept-invitation/${data.id}`;
        const orgName = data.organization?.name ?? "the organization";
        try {
          await sendEmail({
            to: data.email,
            subject: `You've been invited to join ${orgName}`,
            html: `
              <p>You've been invited to join <strong>${orgName}</strong> on T2MS.</p>
              <p><a href="${inviteLink}">Accept invitation</a></p>
              <p>If the link doesn't work, copy and paste this URL into your browser:</p>
              <p>${inviteLink}</p>
            `.trim(),
            text: `You've been invited to join ${orgName} on T2MS. Accept invitation: ${inviteLink}`,
          });
        } catch (error) {
          // Do not fail invitation creation if email delivery fails.
          // Better Auth should still create/store the invitation so it can be accepted via link.
          console.error("[Invite] Failed to send invitation email", {
            email: data.email,
            invitationId: data.id,
            organizationId: data.organization?.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      },
    }),
  ];

if (stripeClient && process.env.STRIPE_WEBHOOK_SECRET) {
  plugins.push(
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "starter",
            priceId: process.env.STRIPE_STARTER_PRICE_ID!,
            limits: {
              websites: 1,
              messages: 100,
              storage: 10
            },
            freeTrial: {
              days: 14
            }
          },
          {
            name: "pro",
            priceId: process.env.STRIPE_PRO_PRICE_ID!,
            limits: {
              websites: 3,
              messages: 330,
              storage: 50
            },
            freeTrial: {
              days: 14
            }
          },
          {
            name: "enterprise",
            priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
            limits: {
              websites: -1,
              messages: -1,
              storage: 1000
            }
          }
        ],
        authorizeReference: async ({ user, session, referenceId, action }) => {
          if (referenceId === user.id) {
            return true;
          }
          return false;
        },
        requireEmailVerification: false
      }
    })
  );
}

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
    secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-change-this-in-production",
    user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      state: {
        type: "string",
        required: false,
        input: true,
      },
      country: {
        type: "string",
        required: false,
        input: true,
      },
      businessCategory: {
        type: "string",
        required: false,
        input: true,
      },
      referralCode: {
        type: "string",
        required: false,
        input: true,
      },
    },
    changeEmail: {
      enabled: true,
    },
  },

	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			const firstName = (user.name ?? "").trim().split(/\s+/)[0] || "there";
			const { subject, html, text } = renderPasswordResetEmail({
				first_name: firstName,
				reset_link: url,
			});
			try {
				await sendEmail({ to: user.email, subject, html, text });
			} catch (error) {
				console.error("[Auth] Password reset email failed", {
					email: user.email,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		},
	},

    plugins,
});
