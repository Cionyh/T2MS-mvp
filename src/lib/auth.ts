
import { betterAuth } from "better-auth";
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe"
import Stripe from "stripe"

const db = new PrismaClient();

// Only create Stripe client when key is set (avoids build failure when env is missing)
const stripeClient = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" })
  : null;

const plugins: Parameters<typeof betterAuth>[0]["plugins"] = [
    admin(),
    organization({
      async sendInvitationEmail(data) {
        // TODO: Implement email sending for organization invitations
        // You can use your email service here (e.g., Resend, SendGrid, etc.)
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invitation/${data.id}`;
        console.log(`Invitation email should be sent to ${data.email} with link: ${inviteLink}`);
        // Example:
        // await sendEmail({
        //   to: data.email,
        //   subject: `You've been invited to join ${data.organization.name}`,
        //   html: `...`
        // });
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
              websites: 50,
              messages: 10000,
              storage: 50
            },
            freeTrial: {
              days: 14
            }
          },
          {
            name: "pro",
            priceId: process.env.STRIPE_PRO_PRICE_ID!,
            limits: {
              websites: 200,
              messages: 50000,
              storage: 200
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
    },
    changeEmail: {
      enabled: true,
    },
  },

	emailAndPassword: {
		enabled: true,
    },

    plugins,
});
