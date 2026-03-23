import { ListPageContext } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import type { Task, WithId } from "@/lib/types";
import { useCallback, useContext, useState } from "react";

interface RandomTaskModalProps {
   trigger: React.ReactElement;
}

export function RandomTaskModal({ trigger }: RandomTaskModalProps) {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const {
      list: { tasks },
      dispatchFilters,
   } = ctx;
   const [isOpen, setIsOpen] = useState<boolean>(false);
   const [includeCompleted, setIncludeCompleted] = useState<boolean>(false);

   const pickRandomTaskId = useCallback(() => {
      const taskArray = Object.entries(tasks || {})
         .map(([id, task]) => {
            if (!includeCompleted && task.completed) {
               return false;
            }

            return {
               _id: id,
               ...task,
            };
         })
         .filter(Boolean) as WithId<Task>[];
      const randomTask = taskArray[Math.floor(Math.random() * taskArray.length)];

      dispatchFilters({
         search: randomTask._id,
      });
      setIsOpen(false);
   }, [includeCompleted, dispatchFilters, tasks]);

   return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
         <DialogTrigger asChild>{trigger}</DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Pick Random Task</DialogTitle>
            </DialogHeader>
            <Field orientation="horizontal">
               <Checkbox
                  id="includeCompleted"
                  checked={includeCompleted}
                  onCheckedChange={(checked) => setIncludeCompleted(typeof checked === "boolean" && checked)}
               />
               <Label htmlFor="includeCompleted">Include completed tasks?</Label>
            </Field>
            <DialogFooter>
               <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
               </DialogClose>
               <Button onClick={pickRandomTaskId}>Pick random</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
