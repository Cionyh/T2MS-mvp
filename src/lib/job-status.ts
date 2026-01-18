/**
 * Install Job Status Constants
 * Phase 2 - Install Job System
 */

export const INSTALL_JOB_STATUS = {
  QUEUED: "QUEUED",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  BLOCKED_WAITING_CUSTOMER: "BLOCKED_WAITING_CUSTOMER",
  SUBMITTED_FOR_QA: "SUBMITTED_FOR_QA",
  NEEDS_FIX: "NEEDS_FIX",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  HOLD_FINANCE_REVIEW: "HOLD_FINANCE_REVIEW",
} as const;

export type InstallJobStatus = typeof INSTALL_JOB_STATUS[keyof typeof INSTALL_JOB_STATUS];

/**
 * Valid status transitions
 */
export const VALID_STATUS_TRANSITIONS: Record<InstallJobStatus, InstallJobStatus[]> = {
  [INSTALL_JOB_STATUS.QUEUED]: [
    INSTALL_JOB_STATUS.ASSIGNED,
    INSTALL_JOB_STATUS.CANCELLED,
    INSTALL_JOB_STATUS.HOLD_FINANCE_REVIEW,
  ],
  [INSTALL_JOB_STATUS.ASSIGNED]: [
    INSTALL_JOB_STATUS.IN_PROGRESS,
    INSTALL_JOB_STATUS.BLOCKED_WAITING_CUSTOMER,
    INSTALL_JOB_STATUS.CANCELLED,
    INSTALL_JOB_STATUS.QUEUED, // Release back to queue
  ],
  [INSTALL_JOB_STATUS.IN_PROGRESS]: [
    INSTALL_JOB_STATUS.SUBMITTED_FOR_QA,
    INSTALL_JOB_STATUS.BLOCKED_WAITING_CUSTOMER,
    INSTALL_JOB_STATUS.CANCELLED,
  ],
  [INSTALL_JOB_STATUS.BLOCKED_WAITING_CUSTOMER]: [
    INSTALL_JOB_STATUS.IN_PROGRESS,
    INSTALL_JOB_STATUS.CANCELLED,
  ],
  [INSTALL_JOB_STATUS.SUBMITTED_FOR_QA]: [
    INSTALL_JOB_STATUS.COMPLETED,
    INSTALL_JOB_STATUS.NEEDS_FIX,
  ],
  [INSTALL_JOB_STATUS.NEEDS_FIX]: [
    INSTALL_JOB_STATUS.IN_PROGRESS,
    INSTALL_JOB_STATUS.SUBMITTED_FOR_QA,
    INSTALL_JOB_STATUS.CANCELLED,
  ],
  [INSTALL_JOB_STATUS.COMPLETED]: [], // Terminal state
  [INSTALL_JOB_STATUS.CANCELLED]: [], // Terminal state
  [INSTALL_JOB_STATUS.HOLD_FINANCE_REVIEW]: [
    INSTALL_JOB_STATUS.QUEUED,
    INSTALL_JOB_STATUS.CANCELLED,
  ],
};

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  from: InstallJobStatus,
  to: InstallJobStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to);
}

/**
 * Worker Availability States
 */
export const WORKER_AVAILABILITY = {
  OFF_SHIFT: "OFF_SHIFT",
  ON_SHIFT: "ON_SHIFT",
  PAUSED: "PAUSED",
} as const;

export type WorkerAvailability = typeof WORKER_AVAILABILITY[keyof typeof WORKER_AVAILABILITY];

/**
 * Install Type Constants
 */
export const INSTALL_TYPE = {
  SCRIPT: "script",
  IFRAME: "iframe",
} as const;

export type InstallType = typeof INSTALL_TYPE[keyof typeof INSTALL_TYPE];

/**
 * Access Method Constants
 */
export const ACCESS_METHOD = {
  TEMPORARY_LOGIN: "temporary_login",
  ADMIN_INVITE: "admin_invite",
  INSTRUCTIONS_ONLY: "instructions",
} as const;

export type AccessMethod = typeof ACCESS_METHOD[keyof typeof ACCESS_METHOD];

/**
 * Worker Payout Status
 */
export const PAYOUT_STATUS = {
  EARNED: "EARNED",
  APPROVED: "APPROVED",
  PAID: "PAID",
} as const;

export type PayoutStatus = typeof PAYOUT_STATUS[keyof typeof PAYOUT_STATUS];
