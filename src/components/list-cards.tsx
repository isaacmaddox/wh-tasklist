import type { List } from "@/lib/types";
import { LockIcon } from "lucide-react";
import { use } from "react";
import { Link } from "react-router-dom";

interface ListCardsProps {
   promise: Promise<List[]>;
}

export function ListCards({ promise }: ListCardsProps) {
   const lists = use(promise);

   return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,350px),1fr))] gap-2">
         {lists.map((list) => {
            return <ListCard key={list.id} list={list} />;
         })}
         {lists.length === 0 && <p className="text-muted-foreground">Nothing to show</p>}
      </div>
   );
}

interface ListCardProps {
   list: List;
}

export function ListCard({ list }: ListCardProps) {
   return (
      <div className="bg-card hover:bg-muted border border-border hover:border-input transition-colors rounded-md p-4 relative">
         <header>
            <h3 className="text-base font-semibold flex items-center">
               {list.name}
               {list.password_protected && <LockIcon className="ml-2 inline text-muted-foreground" size={12} />}
            </h3>
         </header>
         <p className="text-muted-foreground mt-1">{Object.keys(list.tasks || {}).length} tasks</p>
         <Link to={`/l/${list.id}`} className="absolute inset-0 z-10 text-[0px]">
            View list
         </Link>
      </div>
   );
}
