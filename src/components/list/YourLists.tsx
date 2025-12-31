import { auth, db } from "@/lib/firebase";
import type { List } from "@/types";
import { equalTo, onValue, orderByChild, query, ref } from "firebase/database";
import { ListCheckIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { CreateListModal } from "../modals/CreateList";
import { Button } from "../ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { ListCard } from "./ListCard";

export function YourLists() {
   const [isListsLoading, setIsListsLoading] = useState<boolean>(true);
   const [lists, setLists] = useState<List[]>([]);
   const [user] = useAuthState(auth);
   if (!user) throw new Error("No user");

   useEffect(() => {
      if (!user) return;
      setIsListsLoading(true);

      const listsRef = ref(db, "/lists");
      const listsQuery = query(listsRef, orderByChild("owner_id"), equalTo(user!.uid));

      return onValue(listsQuery, (snapshot) => {
         const lists: Record<string, List> | null = snapshot.val();

         if (lists) {
            setLists(Object.values(lists));
         } else {
            setLists([]);
         }

         setIsListsLoading(false);
      });
   }, [user]);

   return (
      <section id="my-lists" aria-labelledby="my-lists-title" className="mt-6">
         <header className="flex gap-3 justify-between items-baseline mb-3">
            <h2 id="my-lists-title" className="text-xl font-semibold leading-snug">
               Your lists
            </h2>
            {lists.length > 0 && (
               <CreateListModal>
                  <Button size="sm">
                     <PlusIcon />
                     New list
                  </Button>
               </CreateListModal>
            )}
         </header>
         {isListsLoading && <p className="text-muted-foreground animate-pulse">Loading your lists...</p>}
         {!isListsLoading && lists.length === 0 && (
            <Empty>
               <EmptyHeader>
                  <EmptyMedia variant="icon">
                     <ListCheckIcon />
                  </EmptyMedia>
                  <EmptyTitle>No lists yet</EmptyTitle>
                  <EmptyDescription>
                     You haven't created any lists yet. Get started by creating your first one.
                  </EmptyDescription>
               </EmptyHeader>
               <EmptyContent>
                  <div className="flex gap-2">
                     <CreateListModal>
                        <Button>Create one</Button>
                     </CreateListModal>
                  </div>
               </EmptyContent>
            </Empty>
         )}
         <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,350px),1fr))] gap-2">
            {lists.map((list) => (
               <ListCard list={list} key={list.id} />
            ))}
         </div>
      </section>
   );
}
