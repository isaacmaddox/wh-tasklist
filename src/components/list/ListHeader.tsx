import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/lib/firebase";
import { isFirebasePermissionError } from "@/lib/utils";
import { ref, set, update } from "firebase/database";
import { HomeIcon, PlayCircleIcon, RotateCw, TrashIcon, UsersIcon, WorkflowIcon } from "lucide-react";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ListCollaboratorsModal } from "../modals/ListCollaborators";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { ListPageContext } from "./ListPageProvider";
import { ListTitle } from "./ListTitle";

export function ListHeader() {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const { list, setList, listRef, updateList, isListLoading, doLiveUpdates, user, dispatchLiveUpdates } = ctx;
   const navigate = useNavigate();
   if (!list) return;

   async function doDeleteList() {
      if (confirm(`Are you sure you want to delete "${list!.name}"?`)) {
         const listName = list!.name;

         try {
            await set(listRef, null);
            toast.success(`${listName} has been deleted`);
            navigate("/");
         } catch (e) {
            if (isFirebasePermissionError(e)) {
               toast.error(`You are not allowed to delete this list`);
            } else {
               toast.error(`Couldn't delete ${listName}`);
            }
         }
      }
   }

   async function doDeleteCompleteTasks() {
      if (!list) throw new Error("No list found");

      const paths = Object.entries(list?.tasks || {}).reduce(
         (acc, [id, task]) => {
            if (task.completed) {
               return {
                  ...acc,
                  [`/lists/${list.id}/tasks/${id}`]: null,
               };
            } else {
               return acc;
            }
         },
         {} as Record<string, null>,
      );

      console.log(paths);

      if (
         !confirm(
            `Are you sure you want to delete ALL completed tasks? ${Object.keys(paths).length} tasks will be affected`,
         )
      )
         return;

      try {
         await update(ref(db), paths);

         if (!doLiveUpdates) {
            setList((l) => {
               if (!l) return l;

               return {
                  ...l,
                  tasks: Object.entries(list?.tasks || {}).reduce((acc, [id, task]) => {
                     if (task.completed) return acc;
                     return {
                        ...acc,
                        [id]: task,
                     };
                  }, {}),
               };
            });
         }

         toast.success("Delete completed tasks");
      } catch (e) {
         console.log(e);

         if (isFirebasePermissionError(e)) {
            toast.error(`You are not allowed to delete tasks in this list`);
         } else {
            toast.error("Couldn't delete tasks");
         }
      }
   }

   return (
      <header className="grid justify-items-start gap-4">
         <Button variant="ghost" size="sm" className="not-hover:px-0 not-hover:text-muted-foreground" asChild>
            <Link to="/">
               <HomeIcon />
               Home
            </Link>
         </Button>
         <ListTitle />
         <ul className="flex items-center gap-2 w-full">
            <li>
               <Button
                  variant={doLiveUpdates ? "default" : "secondary"}
                  onClick={() => dispatchLiveUpdates(!doLiveUpdates)}>
                  <PlayCircleIcon />
                  Live update: {doLiveUpdates ? "on" : "off"}
               </Button>
            </li>
            {!doLiveUpdates && (
               <li>
                  <Button
                     variant="secondary"
                     size="icon"
                     className="starting:opacity-0 starting:-translate-x-8 transition-all"
                     onClick={() => updateList()}>
                     {isListLoading ? <Spinner /> : <RotateCw />}
                  </Button>
               </li>
            )}
            <li className="ml-auto">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="outline">
                        <WorkflowIcon />
                        Actions
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                     <DropdownMenuItem variant="destructive" onSelect={doDeleteCompleteTasks}>
                        <TrashIcon />
                        Delete completed tasks
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </li>
            <li>
               <ListCollaboratorsModal>
                  <Button variant="outline">
                     <UsersIcon />
                     Collaborators ({Object.values(list.shares || {}).filter((isCollaborator) => isCollaborator).length}
                     )
                  </Button>
               </ListCollaboratorsModal>
            </li>
            {list.owner_id === user.uid && (
               <li>
                  <Button variant="destructive" size="icon" onClick={doDeleteList}>
                     <TrashIcon />
                  </Button>
               </li>
            )}
         </ul>
      </header>
   );
}
