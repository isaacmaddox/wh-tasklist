import { auth } from "@/lib/firebase";
import type { UserSettings } from "@/types";
import { createContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

interface SettingsContextValue {
  settings: UserSettings;
  updateSettings: (updates: UserSettings) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: React.PropsWithChildren) {
  const [user] = useAuthState(auth);
  const [settings, setSettings] = useState<UserSettings>({});

  useEffect(() => {
    if (!user) return;

    const fromLocalStorage = localStorage.getItem(`settings-${user.uid}`);

    if (fromLocalStorage) {
      setSettings(JSON.parse(fromLocalStorage) as UserSettings);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    console.log("Writing settings");

    localStorage.setItem(`settings-${user.uid}`, JSON.stringify(settings));
  }, [settings]);

  function updateSettings(updates: UserSettings) {
    setSettings((oldSettings) => {
      return {
        ...oldSettings,
        ...updates,
      };
    });
  }

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>;
}
