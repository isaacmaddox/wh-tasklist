import { LoadingPage } from "@/components/loading-page";
import { ListPageContext } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import { ListService } from "@/lib/services/list-service";
import type { List } from "@/lib/types";
import { useEffect, useState, type PropsWithChildren } from "react";
import { Link } from "react-router-dom";

interface ListPageProviderProps extends PropsWithChildren {
   listId?: string;
}

export function ListPageProvider({ listId, children }: ListPageProviderProps) {
   const [list, setList] = useState<List | null>(null);
   const [isLoading, setIsLoading] = useState<boolean>(true);

   // TODO: Edit list

   useEffect(() => {
      ListService.getInstance()
         .getById(listId)
         .then(setList)
         .finally(() => setIsLoading(false));
   }, [listId]);

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

   return <ListPageContext.Provider value={{ list, setList }}>{children}</ListPageContext.Provider>;
}
