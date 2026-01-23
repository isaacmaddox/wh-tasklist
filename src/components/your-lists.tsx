import { ListCards } from "@/components/list-cards";
import { auth } from "@/lib/firebase";
import { ListService } from "@/lib/services/list-service";
import { Suspense } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export function YourLists() {
   const [user] = useAuthState(auth);
   if (!user) throw new Error("You must be authenticated to view this screen");

   const service = ListService.getInstance();
   const listsPromise = service.getYourLists(user.uid);

   return (
      <section id="my-lists" aria-labelledby="my-lists-title" className="mt-6">
         <header className="flex gap-3 justify-between items-baseline mb-3">
            <h2 id="my-lists-title" className="text-xl font-semibold leading-snug">
               Your lists
            </h2>
         </header>
         <Suspense fallback={<p className="text-muted-foreground animate-pulse">Loading...</p>}>
            <ListCards promise={listsPromise} />
         </Suspense>
      </section>
   );
}
