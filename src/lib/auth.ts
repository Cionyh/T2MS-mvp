
import { betterAuth } from "better-auth";
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";

const db = new PrismaClient();

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
    user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // don't allow user to set role
      },
    },
  },

	emailAndPassword: {
		enabled: true,
    }
});
