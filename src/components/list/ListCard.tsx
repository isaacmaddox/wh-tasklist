import type { List } from "@/types";
import { LockIcon } from "lucide-react";
import { Link } from "react-router-dom";

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
