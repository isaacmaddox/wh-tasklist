import { ListPageContext } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FlagIcon, PlusIcon } from "lucide-react";
import { useContext, useState } from "react";

export function NewTask() {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const [name, setName] = useState<string>("");
   const [date, setDate] = useState<string>("");
   const [flagged, setFlagged] = useState<boolean>(false);
   const { doAddTask } = ctx;

   async function addTask() {
      await doAddTask(name, date, flagged);
      setName("");
      setDate("");
      setFlagged(false);
   }

   return (
      <li className="add-task-row grid grid-cols-subgrid col-span-full items-center">
         <Checkbox disabled />
         <Input
            type="text"
            placeholder="Add task..."
            tabIndex={1}
            className="task-list-input"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            onKeyDown={(e) => {
               if (e.key === "Enter") {
                  addTask();
               }
            }}
         />
         <Input
            type="date"
            tabIndex={2}
            className={cn("task-list-input", date == "" && "text-muted-foreground")}
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
            onKeyDown={(e) => {
               if (e.key === "Enter") {
                  addTask();
               }
            }}
         />
         <Button size="icon-sm" variant="ghost" onClick={() => setFlagged(!flagged)}>
            <FlagIcon
               className={
                  flagged
                     ? "fill-yellow-600 dark:fill-yellow-200 stroke-yellow-600 dark:stroke-yellow-200"
                     : "fill-transparent"
               }
            />
            <span className="sr-only">Flag task</span>
         </Button>
         <Button size="sm" className="w-full col-span-2" onClick={addTask}>
            <PlusIcon />
            Add
         </Button>
      </li>
   );
}
