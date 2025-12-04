import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, Outlet, useSearchParams } from "react-router-dom";

export function AuthPage() {
  const [user, isUserLoading] = useAuthState(auth);
  const [params] = useSearchParams();

  if (user && !isUserLoading) {
    const goTo = params.get("next");

    if (goTo !== null) {
      return <Navigate to={decodeURIComponent(goTo)} />;
    }

    return <Navigate to="/" />;
  }

  return <Outlet />;
}
