import { SharedLists } from "@/components/list/SharedLists";
import { YourLists } from "@/components/list/YourLists";
import { PageWrapper } from "@/layouts/PageWrapper";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export function HomePage() {
   const [user] = useAuthState(auth);
   if (!user) return;

   document.title = "TaskList";

   return (
      <PageWrapper>
         <h1 className="text-3xl w-fit font-bold inline leading-snug align-middle">Welcome back.</h1>
         {user.email && (
            <p className="text-muted-foreground">
               You are logged in as <span className="text-foreground">{user.email}</span>
            </p>
         )}
         <YourLists />
         <SharedLists />
      </PageWrapper>
   );
}
