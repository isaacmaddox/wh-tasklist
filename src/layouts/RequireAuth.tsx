import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { auth } from "@/lib/firebase";
import { useSettings } from "@/lib/hooks/useSettings";
import { SettingsIcon } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";

export function RequireAuth() {
  const [user, isUserLoading] = useAuthState(auth);
  const [params] = useSearchParams();
  const location = useLocation();
  const { settings, updateSettings } = useSettings();

  if (!user && !isUserLoading) {
    const goTo = params.get("next");

    if (goTo !== null) {
      return <Navigate to={decodeURIComponent(goTo)} />;
    }

    if (location) {
      return <Navigate to={`/login?next=${location.pathname}`} />;
    } else {
      return <Navigate to="/login" />;
    }
  }

  if (isUserLoading) {
    return null;
  }

  return (
    <>
      <ul className="fixed top-4 right-4 z-10 flex gap-2">
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
              <SheetDescription>Change some settings to alter your experience with TaskList</SheetDescription>
            </SheetHeader>
            <div className="px-4">
              <Field>
                <FieldLabel htmlFor="appearance-width">Width</FieldLabel>
                <Select
                  defaultValue={settings.appearance?.width || "standard"}
                  onValueChange={(val) => updateSettings({ appearance: { width: val as any } })}>
                  <SelectTrigger id="appearance-width">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="wide">Wide</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </SheetContent>
        </Sheet>
      </ul>
      <Outlet />
    </>
  );
}
