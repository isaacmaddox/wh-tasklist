import { SettingsContext } from "@/components/providers/settings-context";
import { auth } from "@/lib/firebase";
import type { UserSettings } from "@/lib/types";
import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

function getInitialSettings(user: User | null | undefined) {
   return () => {
      if (!user) return {};

      const fromLocalStorage = localStorage.getItem(`settings-${user.uid}`);

      if (fromLocalStorage) {
         return JSON.parse(fromLocalStorage) as UserSettings;
      }

      return {};
   };
}

export function SettingsProvider({ children }: React.PropsWithChildren) {
   const [user] = useAuthState(auth);
   const [settings, setSettings] = useState<UserSettings>(getInitialSettings(user));

   useEffect(() => {
      if (!user) return;
      localStorage.setItem(`settings-${user.uid}`, JSON.stringify(settings));
   }, [user, settings]);

   function updateSettings(updates: UserSettings) {
      setSettings((oldSettings) => {
         const current = { ...oldSettings };

         for (const [key, value] of Object.entries(updates)) {
            current[key as keyof typeof current] = { ...current[key as keyof typeof current], ...value };
         }

         return current;
      });
   }

   return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>;
}
