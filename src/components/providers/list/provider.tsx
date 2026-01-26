import { LoadingPage } from "@/components/loading-page";
import { ListPageContext } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import { ListService } from "@/lib/services/list-service";
import type { List } from "@/lib/types";
import { onValue } from "firebase/database";
import { useEffect, useReducer, useState, type PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface ListPageProviderProps extends PropsWithChildren {
   listId?: string;
}

function liveUpdatesReducer(_: unknown, enable: boolean) {
   localStorage.setItem("live-updates", enable ? "true" : "false");
   return enable;
}

const initialLiveUpdatesPreference = (localStorage.getItem("live-updates") ?? "true") === "true";

export function ListPageProvider({ listId, children }: ListPageProviderProps) {
   const [list, setList] = useState<List | null>(null);
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [doLiveUpdates, dispatchDoLiveUpdates] = useReducer(liveUpdatesReducer, initialLiveUpdatesPreference);

   async function updateList(edits: Partial<List>) {
      if (!list) return;

      const service = ListService.getInstance();
      const { errors } = await service.editList(list.id, edits);

      if (errors) {
         if (errors.general) toast.error(errors.general);
         return;
      }

      if (!doLiveUpdates) {
         setList((oldList) =>
            !oldList
               ? oldList
               : {
                    ...oldList,
                    ...edits,
                 },
         );
      }
   }

   useEffect(() => {
      const service = ListService.getInstance();

      if (!doLiveUpdates) {
         service
            .getById(listId)
            .then(setList)
            .finally(() => setIsLoading(false));
      } else {
         return onValue(service.getReference(listId), (snapshot) => {
            setList(snapshot.val());
            setIsLoading(false);
         });
      }
   }, [listId, doLiveUpdates]);

   if (isLoading) {
      return <LoadingPage />;
   }

   if (list === null) {
      return (
         <div className="grid gap-3 justify-items-start">
            <p>This list doesn't exist or was deleted by its owner.</p>
            <Button variant="secondary" asChild>
               <Link to="/">Go home</Link>
            </Button>
         </div>
      );
   }

   return (
      <ListPageContext.Provider value={{ list, updateList, dispatchDoLiveUpdates }}>
         {children}
      </ListPageContext.Provider>
   );
}
