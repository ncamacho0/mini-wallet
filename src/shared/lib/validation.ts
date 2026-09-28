export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isPhone(value: string): boolean {
  const normalized = value.trim().replace(/[\s-]/g, "");
  return /^\+?\d{7,15}$/.test(normalized);
}

export function isEmailOrPhone(value: string): boolean {
  return isEmail(value) || isPhone(value);
}
