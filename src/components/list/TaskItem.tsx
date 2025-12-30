import { db } from "@/lib/firebase";
import {
   cn,
   DateFormatter,
   formatDateForInput,
   getLocalDateFromInput,
   isFirebasePermissionError,
   isTaskOverdue,
} from "@/lib/utils";
import type { Task } from "@/types";
import { ref, set, update } from "firebase/database";
import { EditIcon, FlagIcon, SaveIcon, TrashIcon, XIcon } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ListPageContext } from "./ListPageProvider";

const inputClassName =
   "dark:scheme-dark text-base! p-0 px-1 leading-9 -mx-1 bg-transparent! border-none focus:border-none rounded-sm";
const textareaClassName = "min-h-9 field-sizing-content resize-none";

interface TaskItemProps {
   defaultTask: Task;
   taskId: string;
}

export function TaskItem({ defaultTask, taskId }: TaskItemProps) {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const { list, setList, doLiveUpdates } = ctx;

   const [isEditing, setIsEditing] = useState<boolean>(false);
   const [task, setTask] = useState<Task>(defaultTask);
   const [updatedTaskName, setUpdatedTaskName] = useState<string>(task.name);
   const [updatedTaskDate, setUpdatedTaskDate] = useState<string>(formatDateForInput(new Date(task.due_date)));
   const taskNameBoxRef = useRef<HTMLTextAreaElement>(null);
   const isOverdue = isTaskOverdue(task);

   useEffect(() => {
      setTask(defaultTask);
   }, [defaultTask]);

   useEffect(() => {
      if (isEditing) {
         requestAnimationFrame(() => {
            taskNameBoxRef.current?.focus();
         });
      }
   }, [isEditing]);

   async function toggleTaskCompleted(completed: boolean) {
      const oldTask = { ...task };

      try {
         setTask((oldTask) => ({
            ...oldTask,
            completed,
         }));

         const taskRef = ref(db, `lists/${task.list_id}/tasks/${taskId}`);
         await update(taskRef, {
            completed,
         });
      } catch (e) {
         setTask(oldTask);

         if (isFirebasePermissionError(e)) {
            toast.error("You are not allowed to update this list");
         } else {
            toast.error("Failed to update task");
         }
      }
   }

   async function doDeleteTask() {
      if (confirm("Are you sure you want to delete this task?")) {
         const oldTask = { ...task };

         const taskRef = ref(db, `lists/${task.list_id}/tasks/${taskId}`);

         try {
            await set(taskRef, null);

            toast.success("Task deleted.", {
               action: {
                  label: "Undo",
                  onClick: async () => {
                     await set(taskRef, oldTask);
                  },
               },
            });

            if (!doLiveUpdates) {
               const newTasks = { ...list?.tasks };

               delete newTasks[taskId];

               setList((oldList) => ({
                  ...oldList!,
                  tasks: newTasks,
               }));
            }
         } catch (e) {
            if (isFirebasePermissionError(e)) {
               toast.error("You are not allowed to delete this task");
            } else {
               toast.error("Unable to delete task");
            }
         }
      }
   }

   async function doUpdateTask() {
      const name = updatedTaskName.trim();

      if (!name) {
         toast.error("Tasks must have a name");
         return;
      } else if (updatedTaskDate === "") {
         toast.error("Tasks must have a due date");
         return;
      }

      try {
         const taskRef = ref(db, `/lists/${task.list_id}/tasks/${taskId}`);
         await update(taskRef, {
            name,
            due_date: getLocalDateFromInput(updatedTaskDate),
         });

         toast.success("Updated task.");

         setIsEditing(false);
         setTask((oldTask) => ({
            ...oldTask,
            name,
            due_date: getLocalDateFromInput(updatedTaskDate),
         }));
      } catch (e) {
         if (isFirebasePermissionError(e)) {
            toast.error("You are not allowed to update this task");
         } else {
            toast.error("Unable to update task");
         }
      }
   }

   async function doFlagTask(flagged: boolean) {
      try {
         const taskRef = ref(db, `/lists/${task.list_id}/tasks/${taskId}`);
         await update(taskRef, {
            flagged,
         });

         toast.success("Updated task.");

         setIsEditing(false);
         setTask((oldTask) => ({
            ...oldTask,
            flagged,
         }));
      } catch (e) {
         if (isFirebasePermissionError(e)) {
            toast.error("You are not allowed to update this task");
         } else {
            toast.error("Unable to update task");
         }
      }
   }

   return (
      <li
         key={taskId}
         className={cn(
            "group/task-item grid relative grid-cols-subgrid col-span-full items-center starting:opacity-0 transition-opacity",
            "after:absolute after:transition-transform after:origin-left after:inset-x-0 after:col-start-2 after:col-span-2 after:h-full after:inset-y-0 after:my-auto after:pointer-events-none",
            !task.completed && "after:scale-x-0"
         )}>
         <Checkbox
            id={`task-${taskId}`}
            checked={task.completed}
            className="self-start mt-2.5"
            onCheckedChange={toggleTaskCompleted}
         />
         {!isEditing && (
            <>
               <label
                  htmlFor={`task-${taskId}`}
                  className={cn(
                     "block min-h-9 leading-9",
                     isOverdue && "text-destructive",
                     task.completed && "text-muted-foreground"
                  )}>
                  {task.name}
               </label>
               <label
                  htmlFor={`task-${taskId}`}
                  className={cn(isOverdue && "text-destructive", task.completed && "text-muted-foreground")}>
                  {DateFormatter.format(new Date(task.due_date))}
               </label>
            </>
         )}
         {isEditing && (
            <>
               <Textarea
                  value={updatedTaskName}
                  onChange={(e) => setUpdatedTaskName(e.currentTarget.value)}
                  className={cn(inputClassName, textareaClassName)}
                  ref={taskNameBoxRef}
                  onFocus={(e) => {
                     e.currentTarget.select();
                  }}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") {
                        e.preventDefault();
                        doUpdateTask();
                     }
                  }}
               />
               <Input
                  type="date"
                  value={updatedTaskDate}
                  onChange={(e) => setUpdatedTaskDate(e.currentTarget.value)}
                  className={inputClassName}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") {
                        doUpdateTask();
                     }
                  }}
               />
            </>
         )}
         {!isEditing && (
            <>
               <Button
                  className="flag-button"
                  variant="ghost-dim"
                  size="icon-sm"
                  onClick={() => doFlagTask(!(task.flagged ?? false))}>
                  <FlagIcon
                     className={
                        task.flagged
                           ? "fill-yellow-600 dark:fill-yellow-200 stroke-yellow-600 dark:stroke-yellow-200"
                           : "fill-transparent"
                     }
                  />
               </Button>
               <Button variant="ghost-dim" size="icon-sm" onClick={() => setIsEditing(true)} disabled={task.completed}>
                  <EditIcon />
               </Button>
               <Button variant="destructive-ghost" size="icon-sm" onClick={doDeleteTask}>
                  <TrashIcon />
               </Button>
            </>
         )}
         {isEditing && (
            <>
               <Button
                  className="flag-button"
                  variant="ghost-dim"
                  size="icon-sm"
                  onClick={() => doFlagTask(!(task.flagged ?? false))}>
                  <FlagIcon
                     className={
                        task.flagged
                           ? "fill-yellow-600 dark:fill-yellow-200 stroke-yellow-600 dark:stroke-yellow-200"
                           : "fill-transparent"
                     }
                  />
               </Button>
               <Button variant="ghost-dim" size="icon-sm" onClick={() => setIsEditing(false)}>
                  <XIcon />
               </Button>
               <Button size="icon-sm" onClick={doUpdateTask}>
                  <SaveIcon />
               </Button>
            </>
         )}
      </li>
   );
}
