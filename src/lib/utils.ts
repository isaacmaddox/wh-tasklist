import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isFirebasePermissionError(e: unknown) {
  return e && typeof e === "object" && "code" in e && e.code === "PERMISSION_DENIED";
}

export function transformEmailToDatabase(key: string) {
  return key.replaceAll(".", ",");
}

export function transformEmailFromDatabase(key: string) {
  return key.replaceAll(",", ".");
}
