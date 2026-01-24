import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { ListService } from "@/lib/services/list-service";
import { useActionState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CreateListModalProps {
   trigger: React.ReactElement;
}

export function CreateListModal({ trigger }: CreateListModalProps) {
   const [user] = useAuthState(auth);
   const [formState, formAction, isFormPending] = useActionState(doCreateList, null);
   const navigate = useNavigate();
   if (!user) throw new Error("You must be logged in to do this");

   async function doCreateList(_: unknown, data: FormData) {
      if (!user) {
         toast.error("You do not have permission to do this");
         return;
      }

      const name = data.get("name") as string;
      const service = ListService.getInstance();

      const { success, errors, data: actionData } = await service.createList({ userId: user.uid, name });

      if (!success) {
         return { errors };
      }

      navigate(`/l/${actionData.id}`);
   }

   return (
      <Dialog>
         <DialogTrigger asChild>{trigger}</DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>New List</DialogTitle>
               <DialogDescription>Make a new list</DialogDescription>
            </DialogHeader>
            <form action={formAction} className="grid grid-rows-subgrid row-span-2">
               <FieldGroup>
                  <Field aria-invalid={!!formState?.errors?.name}>
                     <FieldLabel htmlFor="name">List name</FieldLabel>
                     <Input id="name" name="name" type="text" required aria-invalid={!!formState?.errors?.name} />
                     {formState?.errors?.name && <FieldError>{formState.errors.name}</FieldError>}
                  </Field>
               </FieldGroup>
               <DialogFooter>
                  <Button type="submit" className="w-full" disabled={isFormPending}>
                     {isFormPending ? "Creating..." : "Create"}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
