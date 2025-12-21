/**
 * SMS Whitelist Utility
 * 
 * In staging environment, SMS should only be sent to whitelisted test phone numbers.
 * This prevents accidental SMS charges and ensures staging doesn't send real SMS.
 */

/**
 * Check if the current environment is staging
 */
export function isStagingEnvironment(): boolean {
  // Check for explicit staging environment variable
  if (process.env.ENVIRONMENT === "staging") {
    return true;
  }
  
  // Check if NODE_ENV is staging (access as string to avoid TypeScript strict typing)
  const nodeEnv = process.env.NODE_ENV as string | undefined;
  if (nodeEnv === "staging") {
    return true;
  }
  
  // Check if the base URL contains staging indicators
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL || "";
  if (baseUrl.includes("staging") || baseUrl.includes("stage")) {
    return true;
  }
  
  return false;
}

/**
 * Get the list of whitelisted test phone numbers from environment variable
 * Format: comma-separated phone numbers (e.g., "+1234567890,+0987654321")
 */
function getWhitelistedNumbers(): string[] {
  const whitelist = process.env.SMS_WHITELIST_NUMBERS || "";
  
  if (!whitelist.trim()) {
    return [];
  }
  
  // Split by comma and clean up each number
  return whitelist
    .split(",")
    .map(num => num.trim())
    .filter(num => num.length > 0);
}

/**
 * Normalize phone number for comparison
 * Removes spaces, dashes, parentheses, and ensures consistent format
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, "");
  
  // If it doesn't start with +, add it (assuming US numbers)
  // This is a simple normalization - you may want to adjust based on your needs
  if (!normalized.startsWith("+")) {
    // If it starts with 1 and has 11 digits, add +
    if (normalized.startsWith("1") && normalized.length === 11) {
      normalized = "+" + normalized;
    } else if (normalized.length === 10) {
      // US number without country code
      normalized = "+1" + normalized;
    }
  }
  
  return normalized;
}

/**
 * Check if a phone number is whitelisted
 */
export function isPhoneNumberWhitelisted(phone: string): boolean {
  const whitelistedNumbers = getWhitelistedNumbers();
  
  if (whitelistedNumbers.length === 0) {
    return false;
  }
  
  const normalizedPhone = normalizePhoneNumber(phone);
  
  return whitelistedNumbers.some(whitelisted => {
    const normalizedWhitelisted = normalizePhoneNumber(whitelisted);
    return normalizedPhone === normalizedWhitelisted;
  });
}

/**
 * Check if SMS should be sent to a given phone number
 * Returns true if:
 * - Not in staging environment, OR
 * - In staging environment AND phone number is whitelisted
 */
export function shouldSendSMS(phoneNumber: string): boolean {
  const isStaging = isStagingEnvironment();
  
  // If not staging, always allow SMS
  if (!isStaging) {
    return true;
  }
  
  // If staging, only allow if whitelisted
  const isWhitelisted = isPhoneNumberWhitelisted(phoneNumber);
  
  if (!isWhitelisted) {
    console.warn(
      `🚫 SMS blocked in staging environment for non-whitelisted number: ${phoneNumber}. ` +
      `Add this number to SMS_WHITELIST_NUMBERS environment variable to allow SMS in staging.`
    );
  }
  
  return isWhitelisted;
}

