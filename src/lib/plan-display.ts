import {
  CHURCH_PLAN_ID,
  getChurchIntroPriceLabel,
  isChurchPlanEnabled,
} from "@/lib/church-pricing"
import { CHURCH_PLAN_FEATURES, STARTER_PLAN_FEATURES } from "@/lib/plan-features"

export type PlanOption = {
  id: string
  name: string
  price: string
  description: string
}

const STARTER_OPTION: PlanOption = {
  id: "starter",
  name: "Starter Plan",
  price: "$14.99/mo",
  description: "1 site — hosted page & widget, 100 messages/month, 14-day trial",
}

const PRO_OPTION: PlanOption = {
  id: "pro",
  name: "Growth Plan",
  price: "$29.99/mo",
  description: "Up to 3 sites — hosted page & widget on each, 330 messages/month",
}

const CHURCH_OPTION: PlanOption = {
  id: CHURCH_PLAN_ID,
  name: "Church Intro Plan",
  price: `${getChurchIntroPriceLabel()}/mo`,
  description: "Verified churches — hosted page & widget, intro price locked 3 years",
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

export { CHURCH_PLAN_FEATURES, STARTER_PLAN_FEATURES, isChurchPlanEnabled, getChurchIntroPriceLabel }
