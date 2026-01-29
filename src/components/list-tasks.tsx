import { ListFilters } from "@/components/list-filters";
import { ConfirmModal } from "@/components/modals/confirm";
import { NewTask } from "@/components/new-task";
import { ListPageContext } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/lib/hooks/use-settings";
import type { Task, WithId } from "@/lib/types";
import { cn, DateFormatter, formatDateForInput, isTaskOverdue } from "@/lib/utils";
import _ from "lodash";
import { EditIcon, FlagIcon, SaveIcon, TrashIcon, XIcon } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function includesIgnoreCase(searchString: string, searchTerm: string) {
   return searchString.toLowerCase().replaceAll(/\s/g, "").includes(searchTerm.toLowerCase().replaceAll(/\s/g, ""));
}

export function ListTasks() {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const {
      list: { tasks },
      filters,
      dispatchFilters,
   } = ctx;
   const { settings } = useSettings();

   const filteredTasks = Object.entries(tasks || {}).reduce((accumulator, [taskId, task]) => {
      if (filters.search && !includesIgnoreCase(task.name, filters.search)) return accumulator;
      if (filters.startDate && task.due_date < filters.startDate) return accumulator;
      if (filters.endDate && task.due_date > filters.endDate) return accumulator;
      if (Object.values(filters).some((v) => v === true)) {
         if (filters.showIncomplete && task.completed) return accumulator;
         if (filters.showComplete && !task.completed) return accumulator;
         if (filters.showFlagged && !task.flagged) return accumulator;
         if (filters.showOverdue && !isTaskOverdue(task)) return accumulator;
         if (filters.showDueSoon && isTaskOverdue(task)) return accumulator;
         if (
            filters.showDueSoon &&
            !isTaskOverdue({ ...task, due_date: task.due_date - 86400000 * (settings.function?.soonDays || 3) })
         ) {
            return accumulator;
         }
      }
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
         {orderedTasks.length === 0 && Object.keys(tasks || {}).length > 0 && (
            <li className="text-muted-foreground col-span-full flex flex-wrap gap-2 items-center justify-center">
               No tasks match your filters.{" "}
               <Button variant="secondary" onClick={() => dispatchFilters(null)}>
                  Clear filters
               </Button>
            </li>
         )}
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
   const [isProcessing, setIsProcessing] = useState<boolean>(false);
   const [isEditing, setIsEditing] = useState<boolean>(false);
   const newNameInputRef = useRef<HTMLTextAreaElement>(null);
   const newDateInputRef = useRef<HTMLInputElement>(null);
   const { markTaskComplete, doEditTask, doToggleFlag, doDeleteTask } = ctx;

   const isOverdue = isTaskOverdue(task);

   async function editTask() {
      if (!newNameInputRef.current || !newDateInputRef.current) return toast.error("Something went wrong on our end");
      await doEditTask(task._id, newNameInputRef.current.value, newDateInputRef.current.value);
      setIsEditing(false);
   }

   useEffect(() => {
      if (isEditing) {
         requestAnimationFrame(() => {
            newNameInputRef.current?.focus();
         });
      }
   }, [isEditing]);

   return (
      <li
         key={task._id}
         className={cn(
            "group/task-item grid relative grid-cols-subgrid col-span-full items-center starting:opacity-0 transition-opacity",
            "after:absolute after:transition-transform after:origin-left after:inset-x-0 after:col-start-2 after:col-span-2 after:h-full after:inset-y-0 after:my-auto after:pointer-events-none",
            !task.completed && "after:scale-x-0 after:transition-none",
         )}>
         {isProcessing ? (
            <Spinner className="self-start mt-2.5" />
         ) : (
            <Checkbox
               id={`task-${task._id}`}
               checked={task.completed}
               className="self-start mt-2.5"
               disabled={isEditing}
               onCheckedChange={async (checked) => {
                  setIsProcessing(true);
                  await markTaskComplete(task._id, typeof checked === "boolean" && checked);
                  setIsProcessing(false);
               }}
            />
         )}
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
               <Button
                  className="flag-button"
                  variant="ghost-dim"
                  size="icon-sm"
                  onClick={() => {
                     doToggleFlag(task._id, !task.flagged);
                  }}>
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
               <ConfirmModal
                  onConfirm={() => doDeleteTask(task._id)}
                  text={
                     <>
                        <p>Are you sure you want to delete this task?</p>
                        <p className="mt-2 text-sm text-muted-foreground">{task.name}</p>
                     </>
                  }
                  trigger={
                     <Button variant="destructive-ghost" size="icon-sm">
                        <TrashIcon />
                        <span className="sr-only">Delete task</span>
                     </Button>
                  }
                  buttonVariant="destructive"
               />
            </>
         )}
         {isEditing && (
            <>
               <Textarea
                  className="task-list-input task-list-textarea"
                  onFocus={(e) => e.currentTarget.select()}
                  defaultValue={task.name}
                  ref={newNameInputRef}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") {
                        e.preventDefault();
                        editTask();
                     }
                  }}
               />
               <Input
                  type="date"
                  className="task-list-input"
                  defaultValue={formatDateForInput(new Date(task.due_date))}
                  ref={newDateInputRef}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") editTask();
                  }}
               />
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
                  <span className="sr-only">Cancel</span>
               </Button>
               <Button size="icon-sm" onClick={editTask}>
                  <SaveIcon />
                  <span className="sr-only">Save changes</span>
               </Button>
            </>
         )}
      </li>
   );
}
