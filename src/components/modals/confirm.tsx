import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ConfirmModalProps {
   trigger: React.ReactElement;
   text: string;
   buttonVariant?: React.ComponentProps<typeof Button>["variant"];
   onConfirm: () => unknown;
}

export function ConfirmModal({ trigger, text, buttonVariant, onConfirm }: ConfirmModalProps) {
   const [isOpen, setIsOpen] = useState<boolean>(false);

   return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
         <DialogTrigger asChild>{trigger}</DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Confirm</DialogTitle>
            </DialogHeader>
            <p>{text}</p>
            <DialogFooter>
               <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
               </DialogClose>
               <Button
                  variant={buttonVariant || "default"}
                  onClick={async () => {
                     await onConfirm();
                     setIsOpen(false);
                  }}>
                  Confirm
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
