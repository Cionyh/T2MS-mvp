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
 * - Not in staging environment AND no whitelist is configured, OR
 * - Phone number is whitelisted (if whitelist is configured or in staging)
 */
export function shouldSendSMS(phoneNumber: string): boolean {
  const isStaging = isStagingEnvironment();
  const whitelistNumbers = getWhitelistedNumbers();
  const hasWhitelist = whitelistNumbers.length > 0;
  
  // Log environment detection for debugging
  console.log("🔍 SMS Whitelist Check:", {
    phoneNumber,
    isStaging,
    hasWhitelist,
    whitelistCount: whitelistNumbers.length,
    ENVIRONMENT: process.env.ENVIRONMENT,
    NODE_ENV: process.env.NODE_ENV,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL,
  });
  
  // If whitelist is configured, enforce it regardless of environment detection
  // This provides a safety net if environment detection fails
  if (hasWhitelist) {
    const isWhitelisted = isPhoneNumberWhitelisted(phoneNumber);
    
    if (!isWhitelisted) {
      console.warn(
        `🚫 SMS blocked: Phone number ${phoneNumber} is not in whitelist. ` +
        `Whitelisted numbers: ${whitelistNumbers.join(", ")}`
      );
    } else {
      console.log(`✅ SMS allowed: Phone number ${phoneNumber} is whitelisted`);
    }
    
    return isWhitelisted;
  }
  
  // If no whitelist is configured but we're in staging, block all SMS
  if (isStaging) {
    console.warn(
      `🚫 SMS blocked: Staging environment detected but no SMS_WHITELIST_NUMBERS configured. ` +
      `Set SMS_WHITELIST_NUMBERS environment variable to allow SMS in staging.`
    );
    return false;
  }
  
  // Production or development without whitelist - allow all SMS
  console.log("✅ SMS allowed: Not in staging and no whitelist configured");
  return true;
}

