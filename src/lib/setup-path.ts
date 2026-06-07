export const SETUP_PATH_HOSTED_ONLY = "hosted_only" as const
export const SETUP_PATH_EMBED = "embed" as const

export type OnboardingSetupPath =
  | typeof SETUP_PATH_HOSTED_ONLY
  | typeof SETUP_PATH_EMBED

export function isValidSetupPath(
  value: string | null | undefined
): value is OnboardingSetupPath {
  return value === SETUP_PATH_HOSTED_ONLY || value === SETUP_PATH_EMBED
}

export function isHostedOnlyPath(path: string | null | undefined): boolean {
  return path === SETUP_PATH_HOSTED_ONLY
}
