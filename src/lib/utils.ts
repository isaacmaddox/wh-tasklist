import type { Task } from "@/types";
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

export const DateFormatter = Intl.DateTimeFormat("en", {
   month: "2-digit",
   day: "2-digit",
   year: "numeric",
});

export function formatDateForInput(date: Date) {
   return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")}`;
}

export function getLocalDateFromInput(value: string) {
   const [year, month, day] = value.split("-").map(Number);
   return new Date(year, month - 1, day).getTime();
}

export function isTaskOverdue(task: Task) {
   return new Date(task.due_date + 86400000).getTime() < Date.now();
}
