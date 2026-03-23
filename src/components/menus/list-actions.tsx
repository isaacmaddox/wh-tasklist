import { ConfirmModal } from "@/components/modals/confirm";
import { RandomTaskModal } from "@/components/modals/random-task";
import { ListPageContext } from "@/components/providers/list/context";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DicesIcon, TrashIcon } from "lucide-react";
import { useContext } from "react";

interface ListActionsProps {
   trigger: React.ReactElement;
}

export function ListActions({ trigger }: ListActionsProps) {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const {
      list: { tasks },
      doDeleteCompletedTasks,
   } = ctx;

   const numComplete = Object.values(tasks || {}).reduce((acc, task) => acc + (task.completed ? 1 : 0), 0);

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
               text={
                  <>
                     <p>Are you sure you want to delete all completed tasks?</p>
                     <p className="mt-2 text-muted-foreground text-sm">
                        {numComplete} task{numComplete === 1 ? "" : "s"} will be deleted
                     </p>
                  </>
               }
               buttonVariant="destructive"
            />
            <RandomTaskModal
               trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                     <DicesIcon />
                     Pick Random Task
                  </DropdownMenuItem>
               }
            />
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
