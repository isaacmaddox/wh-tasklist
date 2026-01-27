import { ListActions } from "@/components/menus/list-actions";
import { CollaboratorsModal } from "@/components/modals/collaborators";
import { ConfirmModal } from "@/components/modals/confirm";
import { ListPageContext } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { PlayCircleIcon, RefreshCwIcon, TrashIcon, UsersIcon, WorkflowIcon } from "lucide-react";
import { useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export function ListButtons() {
   const [user] = useAuthState(auth);
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const { list, doLiveUpdates, dispatchDoLiveUpdates, refreshList } = ctx;

   return (
      <ul className="flex items-center pt-1 gap-2 w-full pb-3 border-b">
         <li>
            <Button
               variant={doLiveUpdates ? "default" : "secondary"}
               onClick={() => dispatchDoLiveUpdates(!doLiveUpdates)}>
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
                  onClick={refreshList}>
                  <RefreshCwIcon />
               </Button>
            </li>
         )}
         <li className="ml-auto">
            <ListActions
               trigger={
                  <Button variant="outline">
                     <WorkflowIcon />
                     Actions
                  </Button>
               }
            />
         </li>
         <li>
            <CollaboratorsModal
               trigger={
                  <Button variant="outline">
                     <UsersIcon />
                     Collaborators ({Object.keys(list.shares || {}).length})
                  </Button>
               }
            />
         </li>
         {list.owner_id === user?.uid && (
            <li>
               <ConfirmModal
                  onConfirm={() => {}}
                  trigger={
                     <Button variant="destructive" size="icon">
                        <TrashIcon />
                        <span className="sr-only">Delete list</span>
                     </Button>
                  }
                  text={`Are you sure you want to delete "${list.name}"?`}
                  buttonVariant={"destructive"}
               />
            </li>
         )}
      </ul>
   );
}
