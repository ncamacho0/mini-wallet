const DEFAULT_REDIRECT = "/home";

export function sanitizeRedirect(
  value: string | string[] | undefined,
  fallback: string = DEFAULT_REDIRECT,
): string {
  const target = Array.isArray(value) ? value[0] : value;

  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }
  return target;
}
