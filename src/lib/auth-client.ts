
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import { auth } from "./auth";

export const client = createAuthClient({
	fetchOptions: {
		onError(e) {
			if (e.error.status === 429) {
				toast.error("Too many requests. Please try again later.");
			}
		},
	},
    plugins: [inferAdditionalFields<typeof auth>(),
		adminClient(),
	],
});

export const {
	signUp,
	signIn,
	signOut,
	useSession,
	getSession,
} = client;
