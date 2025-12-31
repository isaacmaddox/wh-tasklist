import { db } from "@/lib/firebase";
import { isFirebasePermissionError, transformEmailFromDatabase, transformEmailToDatabase } from "@/lib/utils";
import { ref, set } from "firebase/database";
import _ from "lodash";
import { PlusIcon, XIcon } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { ListPageContext } from "../list/ListPageProvider";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export function ListCollaboratorsModal({ children }: React.PropsWithChildren) {
   const [newCollaborator, setNewCollaborator] = useState<string>("");

   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const { list, setList, doLiveUpdates, canUserModifyList, user } = ctx;
   if (!list) return;
   const shares = Object.entries(list.shares || {}).reduce((accumulator, currentValue) => {
      return {
         ...accumulator,
         [transformEmailFromDatabase(currentValue[0])]: currentValue[1],
      };
   }, {} as Record<string, boolean>);

   const groupedShares = _.groupBy(Object.entries(shares), (e) => e[1]);

   async function doAddCollaborator(email?: string) {
      if (!list) return;
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email || newCollaborator)) {
         toast.error("Please enter a valid email address");
         return;
      }

      const newEmail = transformEmailToDatabase((email || newCollaborator).trim());

      if (newEmail === transformEmailToDatabase(user.email || "")) {
         toast.error("You cannot add yourself as a collaborator");
         return;
      }

      const shareRef = ref(db, `/lists/${list.id}/shares/${newEmail}`);

      try {
         await set(shareRef, true);

         toast.info(`Added collaborator`);
         setNewCollaborator("");

         if (!doLiveUpdates) {
            setList((oldList) => ({
               ...oldList!,
               shares: {
                  ...oldList!.shares,
                  [newEmail]: true,
               },
            }));
         }
      } catch (e) {
         if (isFirebasePermissionError(e)) {
            toast.error("You are not allowed to add collaborators to this list");
         } else {
            toast.error("Unable to add collaborator list");
         }
      }
   }

   async function doRemoveCollaborator(email: string, permanent: boolean = false) {
      if (!list) return;
      if (email === user.email) {
         toast.error("You cannot remove yourself as a collaborator");
         return;
      }
      const newEmail = transformEmailToDatabase(email);

      const shareRef = ref(db, `/lists/${list.id}/shares/${newEmail}`);

      try {
         await set(shareRef, permanent ? null : false);

         toast.success(`Removed collaborator`);

         if (!doLiveUpdates) {
            const newShares = { ...list.shares };

            if (permanent) delete newShares[newEmail];
            else newShares[newEmail] = false;

            setList((oldList) => ({
               ...oldList!,
               shares: newShares,
            }));
         }
      } catch {
         toast.error("Unable to remove collaborator");
      }
   }

   return (
      <Dialog>
         <DialogTrigger asChild>{children}</DialogTrigger>
         <DialogContent className="max-h-[90svh] overflow-auto">
            <DialogHeader>
               <DialogTitle>
                  Add Collaborators on <em>{list.name}</em>
               </DialogTitle>
               <DialogDescription>Share this list with people so they can access it</DialogDescription>
            </DialogHeader>
            {canUserModifyList && (
               <>
                  <FieldGroup>
                     <Field>
                        <FieldLabel htmlFor="name">Collaborator email</FieldLabel>
                        {list.owner_id !== user.uid && (
                           <FieldDescription>
                              You can add collaborators, but because you don't own this list, you cannot remove them.
                           </FieldDescription>
                        )}
                        <div className="flex gap-2">
                           <Input
                              id="name"
                              name="name"
                              type="email"
                              value={newCollaborator}
                              onKeyDown={(e) => {
                                 if (e.key === "Enter") {
                                    doAddCollaborator();
                                 }
                              }}
                              onChange={(e) => setNewCollaborator(e.currentTarget.value)}
                              required
                           />
                           <Button onClick={() => doAddCollaborator()}>Add</Button>
                        </div>
                     </Field>
                  </FieldGroup>
                  <hr />
               </>
            )}
            <div>
               <h2 className="text-base font-semibold mb-2">Collaborators</h2>
               <ul className="grid grid-cols-[1fr_max-content] gap-3">
                  {groupedShares["true"]?.map(([email]) => {
                     return (
                        <li key={email} className="grid grid-cols-subgrid col-span-full items-center">
                           {email}
                           {list.owner_id === user.uid && (
                              <Button size="icon-xs" variant="ghost" onClick={() => doRemoveCollaborator(email)}>
                                 <XIcon />
                              </Button>
                           )}
                        </li>
                     );
                  })}
                  {!groupedShares["true"] && <li className="col-span-full text-muted-foreground">No collaborators</li>}
               </ul>
               {canUserModifyList && (
                  <>
                     <h2 className="text-base font-semibold mt-4 mb-2">Past collaborators</h2>
                     <ul className="grid grid-cols-[1fr_max-content_max-content] gap-3">
                        {groupedShares["false"]?.map(([email]) => {
                           return (
                              <li key={email} className="grid grid-cols-subgrid col-span-full items-center">
                                 {email}
                                 {list.owner_id === user.uid && (
                                    <>
                                       <Button
                                          size="icon-xs"
                                          variant="ghost"
                                          onClick={() => doRemoveCollaborator(email, true)}>
                                          <XIcon />
                                       </Button>
                                       <Button size="icon-xs" variant="ghost" onClick={() => doAddCollaborator(email)}>
                                          <PlusIcon />
                                       </Button>
                                    </>
                                 )}
                              </li>
                           );
                        })}
                        {!groupedShares["false"] && (
                           <li className="col-span-full text-muted-foreground">No past collaborators</li>
                        )}
                     </ul>
                  </>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
}
