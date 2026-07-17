export const otpStore: { [email: string]: string } = {};

export interface OtpAttemptRecord {
  attempts: number;
  lockedUntil: number | null;
}

export const otpAttemptStore: { [email: string]: OtpAttemptRecord } = {};

export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function getOtpAttemptRecord(email: string): OtpAttemptRecord {
  if (!otpAttemptStore[email]) {
    otpAttemptStore[email] = { attempts: 0, lockedUntil: null };
  }
  return otpAttemptStore[email];
}

export function isOtpLocked(email: string): boolean {
  const record = getOtpAttemptRecord(email);
  if (record.lockedUntil === null) return false;
  if (Date.now() >= record.lockedUntil) {
    record.lockedUntil = null;
    record.attempts = 0;
    return false;
  }
  return true;
}

export function recordOtpAttempt(email: string): void {
  const record = getOtpAttemptRecord(email);
  record.attempts += 1;
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + OTP_LOCKOUT_DURATION_MS;
  }
}

export function resetOtpAttempts(email: string): void {
  delete otpAttemptStore[email];
}
