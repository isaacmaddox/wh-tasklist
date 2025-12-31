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

  return (
    <>
      {import.meta.env.VITE_ENV === "staging" && (
        <div className="fixed top-0 inset-x-0 p-2 text-center font-bold uppercase bg-yellow-400/10 text-yellow-400 not-dark:text-yellow-800 not-dark:bg-yellow-600/10">
          Staging environment - you will need a new account
        </div>
      )}
      <Outlet />
    </>
  );
}
