import { ConfirmModal } from "@/components/modals/confirm";
import { ListPageContext } from "@/components/providers/list/context";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrashIcon } from "lucide-react";
import { useContext } from "react";

interface ListActionsProps {
   trigger: React.ReactElement;
}

export function ListActions({ trigger }: ListActionsProps) {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const { doDeleteCompletedTasks } = ctx;

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
         <DropdownMenuContent>
            <ConfirmModal
               onConfirm={doDeleteCompletedTasks}
               trigger={
                  <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                     <TrashIcon />
                     Delete completed tasks
                  </DropdownMenuItem>
               }
               text="Are you sure you want to delete all completed tasks?"
               buttonVariant="destructive"
            />
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
