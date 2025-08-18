
import { betterAuth } from "better-auth";
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";

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
        input: false,
      },
    },
  },

	emailAndPassword: {
		enabled: true,
    },

    plugins: [
    admin(),
  ],
});
