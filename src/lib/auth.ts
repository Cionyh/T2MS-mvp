
import { betterAuth } from "better-auth";
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe"
import Stripe from "stripe"

const db = new PrismaClient();
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

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
  },

	emailAndPassword: {
		enabled: true,
    },

    plugins: [
    admin(),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "starter",
            priceId: process.env.STRIPE_STARTER_PRICE_ID!,
            limits: {
              websites: 3,
              messages: 100,
              storage: 1
            },
            freeTrial: {
              days: 14
            }
          },
          {
            name: "pro",
            priceId: process.env.STRIPE_PRO_PRICE_ID!,
            limits: {
              websites: 10,
              messages: 1000,
              storage: 10
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
              storage: 100
            }
          }
        ],
        authorizeReference: async ({ user, session, referenceId, action }) => {
          // Allow users to manage their own subscriptions
          // For now, we'll allow any authenticated user to manage subscriptions with their own user ID
          if (referenceId === user.id) {
            return true;
          }
          
          // You can add more complex authorization logic here
          // For example, check if the user is an admin or has permission to manage the organization
          return false;
        },
        requireEmailVerification: false
      }
    })
  ],
});
