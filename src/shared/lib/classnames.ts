export function cn(...inputs: Array<string | false | undefined | null>): string {
  return inputs
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" ");
}
