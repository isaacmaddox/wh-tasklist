import type { UserSettings } from "@/lib/types";
import { createContext } from "react";

interface SettingsContextValue {
   settings: UserSettings;
   updateSettings: (updates: UserSettings) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
