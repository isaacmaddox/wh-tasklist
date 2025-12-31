import { auth, db } from "@/lib/firebase";
import { transformEmailToDatabase } from "@/lib/utils";
import type { List } from "@/types";
import { equalTo, onValue, orderByChild, query, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { ListCard } from "./ListCard";

export function SharedLists() {
  const [isListsLoading, setIsListsLoading] = useState<boolean>(true);
  const [lists, setLists] = useState<List[]>([]);
  const [user] = useAuthState(auth);
  if (!user) return;

  useEffect(() => {
    if (!user || !user.email) return;
    setIsListsLoading(true);

    const listsRef = ref(db, "/lists");
    const listsQuery = query(listsRef, orderByChild(`shares/${transformEmailToDatabase(user.email)}`), equalTo(true));

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
      <h2 id="my-lists-title" className="text-xl font-semibold leading-snug mb-3">
        Shared with me
      </h2>
      {isListsLoading && <p className="text-muted-foreground animate-pulse">Loading your lists...</p>}
      {!isListsLoading && lists.length === 0 && <p className="text-muted-foreground">No lists have been shared with you yet.</p>}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,350px),1fr))]  gap-2">
        {lists.map((list) => (
          <ListCard list={list} key={list.id} />
        ))}
      </div>
    </section>
  );
}
