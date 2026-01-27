import type { Theme } from "@/components/providers/theme/context";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { useSettings } from "@/lib/hooks/use-settings";
import { useTheme } from "@/lib/hooks/use-theme";
import type { UserSettings } from "@/lib/types";
import { signOut } from "firebase/auth";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

export function SettingsSheet() {
   const { settings, updateSettings } = useSettings();
   const { theme, setTheme } = useTheme();

   return (
      <Sheet>
         <SheetTrigger asChild>
            <Button variant="outline">
               <SettingsIcon />
               Settings
            </Button>
         </SheetTrigger>
         <SheetContent>
            <SheetHeader>
               <SheetTitle>Settings</SheetTitle>
               <SheetDescription>Alter the look and feel of TaskList</SheetDescription>
            </SheetHeader>
            <div className="px-4 grid gap-4">
               <Field>
                  <FieldLabel htmlFor="appearance-width">Width</FieldLabel>
                  <Select
                     defaultValue={settings.appearance?.width || "standard"}
                     onValueChange={(val) =>
                        updateSettings({
                           appearance: { width: val as NonNullable<UserSettings["appearance"]>["width"] },
                        })
                     }>
                     <SelectTrigger id="appearance-width">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="standard">Standard (default)</SelectItem>
                        <SelectItem value="wide">Wide</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                     </SelectContent>
                  </Select>
               </Field>
               <hr />
               <Field>
                  <FieldLabel htmlFor="soon-days">"Soon" days</FieldLabel>
                  <FieldDescription>
                     Specify how many days in the future the "Due Soon" filter should match
                  </FieldDescription>
                  <Input
                     id="soon-days"
                     type="number"
                     defaultValue={settings.function?.soonDays || 3}
                     onChange={(e) => {
                        updateSettings({ function: { soonDays: Number(e.currentTarget.value) } });
                     }}
                  />
               </Field>
               <hr />
               <Field>
                  <FieldLabel htmlFor="theme-select">Theme</FieldLabel>
                  <Select defaultValue={theme || "dark"} onValueChange={(val) => setTheme(val as Theme)}>
                     <SelectTrigger id="theme-select">
                        <SelectValue placeholder="Select theme" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                     </SelectContent>
                  </Select>
               </Field>
            </div>
            <SheetFooter>
               <Button variant="secondary" onClick={() => signOut(auth)}>
                  <LogOutIcon />
                  Log out
               </Button>
            </SheetFooter>
         </SheetContent>
      </Sheet>
   );
}
