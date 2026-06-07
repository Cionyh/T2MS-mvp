import type { auth } from "./auth";

export type Session = typeof auth.$Infer.Session;

export type AuthGetSessionResult = Awaited<
  ReturnType<typeof auth.api.getSession>
>;

type AuthDbSession = NonNullable<AuthGetSessionResult>["session"] & {
  impersonatedBy?: string | null;
};

export function isImpersonating(
  session: AuthGetSessionResult | null | undefined
): boolean {
  const dbSession = session?.session as AuthDbSession | undefined;
  return Boolean(dbSession?.impersonatedBy);
}

