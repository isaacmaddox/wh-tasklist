import { ListFilters } from "@/components/list-filters";
import { NewTask } from "@/components/new-task";
import { ListPageContext } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Task, WithId } from "@/lib/types";
import { cn, DateFormatter, isTaskOverdue } from "@/lib/utils";
import _ from "lodash";
import { EditIcon, FlagIcon, SaveIcon, TrashIcon, XIcon } from "lucide-react";
import { useContext, useState } from "react";

function includesIgnoreCase(searchString: string, searchTerm: string) {
   return searchString.toLowerCase().replaceAll(/\s/g, "").includes(searchTerm.replaceAll(/\s/g, ""));
}

export function ListTasks() {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const {
      list: { tasks },
      filters,
   } = ctx;

   const filteredTasks = Object.entries(tasks || {}).reduce((accumulator, [taskId, task]) => {
      if (filters.search && !includesIgnoreCase(task.name, filters.search)) return accumulator;
      return accumulator.concat({ ...task, _id: taskId });
   }, [] as WithId<Task>[]);

   const orderedTasks = _.orderBy(filteredTasks, ["due_date", "name"]);

   return (
      <ul className="grid grid-cols-[max-content_1fr_max-content_min-content_min-content_min-content] gap-y-4 gap-3 task-list">
         <ListFilters />
         <li
            className={cn(
               "tasks-header-row grid grid-cols-subgrid col-span-full items-center pb-4 border-b border-border",
            )}>
            <p className="text-base leading-none font-semibold col-span-2">Task</p>
            <p className="text-base leading-none font-semibold">Due Date</p>
         </li>
         <NewTask />
         {orderedTasks.map((task) => {
            return <ListItem key={task._id} task={task} />;
         })}
      </ul>
   );
}

interface ListItemProps {
   task: WithId<Task>;
}

function ListItem({ task }: ListItemProps) {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const [isEditing, setIsEditing] = useState<boolean>(false);
   const isOverdue = isTaskOverdue(task);
   const { markTaskComplete } = ctx;

   return (
      <li
         key={task._id}
         className={cn(
            "group/task-item grid relative grid-cols-subgrid col-span-full items-center starting:opacity-0 transition-opacity",
            "after:absolute after:transition-transform after:origin-left after:inset-x-0 after:col-start-2 after:col-span-2 after:h-full after:inset-y-0 after:my-auto after:pointer-events-none",
            !task.completed && "after:scale-x-0 after:transition-none",
         )}>
         <Checkbox
            id={`task-${task._id}`}
            checked={task.completed}
            className="self-start mt-2.5"
            onCheckedChange={(checked) => {
               markTaskComplete(task._id, typeof checked === "boolean" && checked);
            }}
         />
         {!isEditing && (
            <>
               <label
                  htmlFor={`task-${task._id}`}
                  className={cn(
                     "block min-h-9 leading-9",
                     isOverdue && "text-destructive",
                     task.completed && "text-muted-foreground",
                  )}>
                  {task.name}
               </label>
               <label
                  htmlFor={`task-${task._id}`}
                  className={cn(isOverdue && "text-destructive", task.completed && "text-muted-foreground")}>
                  {DateFormatter.format(new Date(task.due_date))}
               </label>
               <Button className="flag-button" variant="ghost-dim" size="icon-sm">
                  <FlagIcon
                     className={
                        task.flagged
                           ? "fill-yellow-600 dark:fill-yellow-200 stroke-yellow-600 dark:stroke-yellow-200"
                           : "fill-transparent"
                     }
                  />
                  <span className="sr-only">{task.flagged ? "Flagged" : "Not flagged"}</span>
               </Button>
               <Button variant="ghost-dim" size="icon-sm" onClick={() => setIsEditing(true)} disabled={task.completed}>
                  <EditIcon />
                  <span className="sr-only">Edit task</span>
               </Button>
               <Button variant="destructive-ghost" size="icon-sm">
                  <TrashIcon />
                  <span className="sr-only">Delete task</span>
               </Button>
            </>
         )}
         {isEditing && (
            <>
               <Textarea className="task-list-input task-list-textarea" onFocus={(e) => e.currentTarget.select()} />
               <Input type="date" className="task-list-input" />
               <Button className="flag-button" variant="ghost-dim" size="icon-sm">
                  <FlagIcon
                     className={
                        task.flagged
                           ? "fill-yellow-600 dark:fill-yellow-200 stroke-yellow-600 dark:stroke-yellow-200"
                           : "fill-transparent"
                     }
                  />
                  <span className="sr-only">{task.flagged ? "Flagged" : "Not flagged"}</span>
               </Button>
               <Button variant="ghost-dim" size="icon-sm" onClick={() => setIsEditing(false)}>
                  <XIcon />
               </Button>
               <Button size="icon-sm">
                  <SaveIcon />
               </Button>
            </>
         )}
      </li>
   );
}
