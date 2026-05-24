import {
  CHURCH_PLAN_FEATURES,
  CHURCH_PLAN_ID,
  getChurchIntroPriceLabel,
  isChurchPlanEnabled,
} from "@/lib/church-pricing"

export type PlanOption = {
  id: string
  name: string
  price: string
  description: string
}

const STARTER_OPTION: PlanOption = {
  id: "starter",
  name: "Limited Offer Early Bird Special",
  price: "$14.99/mo",
  description: "1 website, 100 messages/month, 14-day free trial",
}

const PRO_OPTION: PlanOption = {
  id: "pro",
  name: "Limited Offer Standard Price",
  price: "$29.99/mo",
  description: "Up to 3 websites, 330 messages/month, 14-day free trial",
}

const CHURCH_OPTION: PlanOption = {
  id: CHURCH_PLAN_ID,
  name: "Church Intro",
  price: `${getChurchIntroPriceLabel()}/mo`,
  description: "1 hosted page, 100 messages/month, introductory church pricing",
}

const ENTERPRISE_OPTION: PlanOption = {
  id: "enterprise",
  name: "Enterprise / Teams",
  price: "Contact us",
  description: "For large enterprises and teams",
}

const FREE_OPTION: PlanOption = {
  id: "free",
  name: "Free",
  price: "$0",
  description: "Get started with limited features",
}

/** Plans shown on change-plan and similar account flows. */
export function getSelectablePlanOptions(): PlanOption[] {
  const options: PlanOption[] = []
  if (isChurchPlanEnabled()) {
    options.push(CHURCH_OPTION)
  }
  options.push(STARTER_OPTION, PRO_OPTION)
  return options
}

export function getPlanOptionById(planId: string): PlanOption | undefined {
  if (planId === CHURCH_PLAN_ID && isChurchPlanEnabled()) {
    return CHURCH_OPTION
  }
  return getSelectablePlanOptions().find((p) => p.id === planId)
}

export function resolvePlanOption(planId: string): PlanOption {
  return (
    getPlanOptionById(planId) ??
    (planId === "enterprise"
      ? ENTERPRISE_OPTION
      : planId === "free"
        ? FREE_OPTION
        : STARTER_OPTION)
  )
}

export function formatPlanLabel(planId: string): string {
  return resolvePlanOption(planId).name
}

export { CHURCH_PLAN_FEATURES, isChurchPlanEnabled, getChurchIntroPriceLabel }
