import { SettingsContext } from "@/components/providers/settings/context";
import { useContext } from "react";

export function useSettings() {
   const ctx = useContext(SettingsContext);
   if (!ctx) throw new Error("useSettings must be called in a SettingsProvider");

   return ctx;
}
