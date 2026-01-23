import { ListCards } from "@/components/list-cards";
import { auth } from "@/lib/firebase";
import { ListService } from "@/lib/services/list-service";
import { Suspense } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export function SharedLists() {
   const [user] = useAuthState(auth);
   if (!user) throw new Error("You must be authenticated to view this screen");
   if (!user.email) throw new Error("You must have an email associated with your account");

   const service = ListService.getInstance();
   const listsPromise = service.getSharedLists(user.email);

   return (
      <section id="my-lists" aria-labelledby="my-lists-title" className="mt-6">
         <header className="flex gap-3 justify-between items-baseline mb-3">
            <h2 id="my-lists-title" className="text-xl font-semibold leading-snug">
               Shared with you
            </h2>
         </header>
         <Suspense fallback={<p className="text-muted-foreground animate-pulse">Loading...</p>}>
            <ListCards promise={listsPromise} />
         </Suspense>
      </section>
   );
}
