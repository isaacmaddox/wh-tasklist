import { SharedLists } from "@/components/shared-lists";
import { Button } from "@/components/ui/button";
import { YourLists } from "@/components/your-lists";
import { PageWrapper } from "@/layouts/page-wrapper";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";

export function HomePage() {
   const [user] = useAuthState(auth);

   useEffect(() => {
      document.title = "TaskList";
   }, []);

   return (
      <PageWrapper className="relative">
         <h1 className="text-3xl w-fit font-bold inline leading-snug align-middle">Welcome back.</h1>
         {user?.email && (
            <p className="text-muted-foreground">
               You are logged in as <span className="text-foreground">{user.email}</span>.{" "}
               <Button className="text-base px-0 text-muted-foreground" variant="link" onClick={() => signOut(auth)}>
                  Log out.
               </Button>
            </p>
         )}
         <YourLists />
         <SharedLists />
         <footer className="absolute bottom-0 inset-x-0 text-muted-foreground text-center">
            Designed and Developed by{" "}
            <Link
               to="https://isaacmaddox.dev"
               target="_blank"
               className="underline-offset-2 hover:underline hover:text-foreground">
               Isaac Maddox
            </Link>
         </footer>
      </PageWrapper>
   );
}
