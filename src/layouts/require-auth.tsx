import { LoadingPage } from "@/components/loading-page";
import { SettingsSheet } from "@/components/settings-sheet";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function RequireAuth() {
   const [user, isUserLoading] = useAuthState(auth);
   const location = useLocation();

   if (!user && !isUserLoading) {
      // Redirect unauthenticated user to login page

      if (location) {
         return <Navigate to={`/login?next=${decodeURIComponent(location.pathname)}`} />;
      }

      return <Navigate to="/login" />;
   }

   if (isUserLoading) {
      return <LoadingPage />;
   }

   return (
      <>
         <ul className="fixed top-6 right-6 z-10 flex gap-2">
            <SettingsSheet />
         </ul>
         <Outlet />
      </>
   );
}
