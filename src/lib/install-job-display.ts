import { INSTALL_JOB_STATUS } from "@/lib/job-status"

/** Auto-created before the customer submits install details. */
export const INSTALL_JOB_PLACEHOLDER_PLATFORM = "To be confirmed"

type InstallJobLike = {
  platform?: string | null
  status: string
}

export function isActiveInstallJob(job: InstallJobLike): boolean {
  return (
    job.status !== INSTALL_JOB_STATUS.COMPLETED &&
    job.status !== INSTALL_JOB_STATUS.CANCELLED
  )
}

/** Customer has not submitted platform / access details yet. */
export function installJobNeedsCustomerForm(job: InstallJobLike): boolean {
  return (
    job.platform === INSTALL_JOB_PLACEHOLDER_PLATFORM &&
    isActiveInstallJob(job)
  )
}

/** Queued placeholder job — widget should prompt for the install form. */
export function installJobAwaitingFormQueue(job: InstallJobLike): boolean {
  return (
    installJobNeedsCustomerForm(job) &&
    job.status === INSTALL_JOB_STATUS.QUEUED
  )
}

export function getWidgetInstallStatusLabel(job: InstallJobLike): string {
  if (installJobAwaitingFormQueue(job)) return "Install form needed"
  if (isActiveInstallJob(job)) return "Install in progress"
  return "Widget hidden"
}
