import { LoadingPage } from "@/components/loading-page";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, Outlet, useSearchParams } from "react-router-dom";

export function AuthPage() {
   const [user, isUserLoading] = useAuthState(auth);
   const [params] = useSearchParams();

   if (user && !isUserLoading) {
      const nextURL = params.get("next");

      if (nextURL !== null) {
         return <Navigate to={decodeURIComponent(nextURL)} />;
      }

      return <Navigate to="/" />;
   }

   if (isUserLoading) {
      return <LoadingPage />;
   }

   return (
      <>
         {import.meta.env.VITE_ENV === "staging" && (
            <div className="fixed top-0 inset-x-0 p-2 text-center font-bold uppercase bg-yellow-400/10 text-yellow-400 not-dark:bg-yellow-60/10 not-dark:text-yellow-800">
               Staging environment &mdash; you will need a new account
            </div>
         )}
         <Outlet />
      </>
   );
}
