
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import { auth } from "./auth";
import { stripeClient } from "@better-auth/stripe/client";

export const client = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
	fetchOptions: {
		onError(e) {
			if (e.error.status === 429) {
				toast.error("Too many requests. Please try again later.");
			}
		},
	},
    plugins: [inferAdditionalFields<typeof auth>(),
		adminClient(),
		stripeClient({
            subscription: true //if you want to enable subscription management
        })
	],
});

export const {
	signUp,
	signIn,
	signOut,
	useSession,
	getSession,
} = client;
