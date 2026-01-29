import { ListPageContext } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { auth } from "@/lib/firebase";
import { transformEmailFromDatabase } from "@/lib/utils";
import _ from "lodash";
import { PlusIcon, XIcon } from "lucide-react";
import { useContext, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

interface CollaboratorsModalProps {
   trigger: React.ReactElement;
}

export function CollaboratorsModal({ trigger }: CollaboratorsModalProps) {
   const [user] = useAuthState(auth);
   const [email, setEmail] = useState<string>("");
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const { list, doAddCollaborator, doRemoveCollaborator } = ctx;

   const canUserModifyCollaborators =
      user?.uid === list.owner_id ||
      Object.entries(list.shares || {}).some(
         ([email, allowed]) => user?.email === transformEmailFromDatabase(email) && allowed,
      );

   const groupedShares = _.groupBy(Object.entries(list.shares || {}), (e) => e[1]);

   return (
      <Dialog>
         <DialogTrigger asChild>{trigger}</DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Add collaborators to &quot;{list.name}&quot;</DialogTitle>
               <DialogDescription>
                  {user?.uid === list.owner_id
                     ? "Share this list with people so they can access it"
                     : "You can add collaborators, but not remove them"}
               </DialogDescription>
            </DialogHeader>
            {canUserModifyCollaborators && (
               <FieldGroup>
                  <Field>
                     <FieldLabel htmlFor="email">Collaborator email</FieldLabel>
                     <InputGroup>
                        <InputGroupInput
                           type="email"
                           id="email"
                           name="email"
                           value={email}
                           onChange={(e) => setEmail(e.currentTarget.value)}
                           onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                 doAddCollaborator(email);
                                 setEmail("");
                              }
                           }}
                           required
                        />
                        <InputGroupAddon align="inline-end">
                           <InputGroupButton
                              variant="default"
                              onClick={() => {
                                 doAddCollaborator(email);
                                 setEmail("");
                              }}>
                              <PlusIcon /> Add
                           </InputGroupButton>
                        </InputGroupAddon>
                     </InputGroup>
                  </Field>
               </FieldGroup>
            )}
            <div>
               <h2 className="text-base font-semibold mb-2">Collaborators</h2>
               <ul className="grid grid-cols-[1fr_max-content] gap-3">
                  {groupedShares["true"]?.map(([email]) => {
                     return (
                        <li key={email} className="grid grid-cols-subgrid col-span-full items-center">
                           {transformEmailFromDatabase(email)}
                           {list.owner_id === user?.uid && (
                              <Button
                                 size="icon-xs"
                                 variant="ghost"
                                 onClick={(e) => doRemoveCollaborator(email, e.shiftKey ? true : false)}>
                                 <XIcon />
                                 <span className="sr-only">Remove collaborator</span>
                              </Button>
                           )}
                        </li>
                     );
                  })}
                  {!groupedShares["true"] && <li className="col-span-full text-muted-foreground">No collaborators</li>}
               </ul>
               {canUserModifyCollaborators && (
                  <>
                     <h2 className="text-base font-semibold mt-4 mb-2">Past collaborators</h2>
                     <ul className="grid grid-cols-[1fr_max-content_max-content] gap-3">
                        {groupedShares["false"]?.map(([email]) => {
                           return (
                              <li key={email} className="grid grid-cols-subgrid col-span-full items-center">
                                 {transformEmailFromDatabase(email)}
                                 {list.owner_id === user?.uid && (
                                    <>
                                       <Button
                                          size="icon-xs"
                                          variant="ghost"
                                          onClick={() => doRemoveCollaborator(email, true)}>
                                          <XIcon />
                                          <span className="sr-only">Remove permanently</span>
                                       </Button>
                                       <Button
                                          size="icon-xs"
                                          variant="ghost"
                                          onClick={() => doAddCollaborator(transformEmailFromDatabase(email))}>
                                          <PlusIcon />
                                          <span className="sr-only">Add collaborator</span>
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
