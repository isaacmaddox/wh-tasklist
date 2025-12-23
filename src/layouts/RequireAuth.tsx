import { SettingsSheet } from "@/components/SettingsSheet";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";

export function RequireAuth() {
  const [user, isUserLoading] = useAuthState(auth);
  const [params] = useSearchParams();
  const location = useLocation();

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
        <SettingsSheet />
      </ul>
      <Outlet />
    </>
  );
}
