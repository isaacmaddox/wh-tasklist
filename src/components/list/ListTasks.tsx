import { db } from "@/lib/firebase";
import { cn, isFirebasePermissionError } from "@/lib/utils";
import type { Task } from "@/types";
import { push, ref, set, update } from "firebase/database";
import _ from "lodash";
import { EditIcon, PlusIcon, SaveIcon, TrashIcon, XIcon } from "lucide-react";
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
const DateFormatter = Intl.DateTimeFormat("en", {
   month: "2-digit",
   day: "2-digit",
   year: "numeric",
});
function formatDateForInput(date: Date) {
   return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")}`;
}
function getLocalDateFromInput(value: string) {
   const [year, month, day] = value.split("-").map(Number);
   return new Date(year, month - 1, day).getTime();
}

export function ListTasks() {
   const ctx = useContext(ListPageContext);
   const newTaskInputRef = useRef<HTMLInputElement>(null);
   const [newTaskName, setNewTaskName] = useState<string>("");
   const [newTaskDate, setNewTaskDate] = useState<string>("");
   if (!ctx) return;
   const { list, setList, doLiveUpdates, canUserModifyList } = ctx;
   if (!list) return;

   async function doAddTask() {
      const name = newTaskName.trim();

      if (!name) {
         toast.error("Tasks must have a name");
         return;
      } else if (newTaskDate === "") {
         toast.error("Tasks must have a due date");
         return;
      }

      const newTask: Task = {
         name,
         due_date: getLocalDateFromInput(newTaskDate),
         completed: false,
         list_id: list!.id,
      };

      try {
         const taskRef = ref(db, `/lists/${list!.id}/tasks`);
         const newTaskRef = await push(taskRef, newTask);

         if (!doLiveUpdates) {
            setList((oldList) => ({
               ...oldList!,
               tasks: {
                  ...oldList!.tasks,
                  [newTaskRef.key!]: newTask,
               },
            }));
         }

         setNewTaskName("");
         setNewTaskDate("");

         newTaskInputRef?.current?.focus();
      } catch {
         toast.error("You cannot add tasks to this list");
      }
   }

   return (
      <ul className="grid grid-cols-[max-content_1fr_max-content_max-content_max-content] gap-3 gap-y-4 task-list">
         <li className="grid grid-cols-subgrid col-span-full items-center pb-3 border-b border-border">
            <p className="text-base font-semibold col-span-2">Task</p>
            <p className="text-base font-semibold">Due Date</p>
         </li>
         {canUserModifyList && (
            <li className="grid grid-cols-subgrid col-span-full items-center add-task-row">
               <Checkbox disabled />
               <Input
                  type="text"
                  ref={newTaskInputRef}
                  placeholder="Add task..."
                  tabIndex={1}
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.currentTarget.value)}
                  className={inputClassName}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") {
                        doAddTask();
                     }
                  }}
               />
               <Input
                  type="date"
                  className={cn(inputClassName, newTaskDate === "" && "text-muted-foreground")}
                  value={newTaskDate}
                  tabIndex={2}
                  onChange={(e) => setNewTaskDate(e.currentTarget.value)}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") {
                        doAddTask();
                     }
                  }}
               />
               <Button size="sm" className="w-full col-span-2" onClick={doAddTask}>
                  <PlusIcon />
                  Add
               </Button>
            </li>
         )}
         {_.orderBy(Object.entries(list.tasks || {}), [([, t]) => new Date(t.due_date)], "asc").map(
            ([taskId, task]) => {
               return <TaskItem key={taskId} taskId={taskId} defaultTask={task} />;
            }
         )}
      </ul>
   );
}

interface TaskItemProps {
   defaultTask: Task;
   taskId: string;
}

function TaskItem({ defaultTask, taskId }: TaskItemProps) {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const { list, setList, doLiveUpdates } = ctx;
   const [isEditing, setIsEditing] = useState<boolean>(false);
   const [task, setTask] = useState<Task>(defaultTask);
   const [updatedTaskName, setUpdatedTaskName] = useState<string>(task.name);
   const [updatedTaskDate, setUpdatedTaskDate] = useState<string>(formatDateForInput(new Date(task.due_date)));
   const taskNameBoxRef = useRef<HTMLTextAreaElement>(null);
   const isOverdue = task.due_date < Date.now() - (Date.now() % 86400000);

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

   return (
      <li
         key={taskId}
         className={cn(
            "group/task-item grid relative grid-cols-subgrid col-span-full items-center starting:opacity-0 starting:-translate-x-8 transition-[opacity,transform_1s]",
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
               <Button variant="ghost-dim" size="icon-sm" onClick={() => setIsEditing(true)}>
                  <EditIcon />
               </Button>
               <Button variant="destructive-ghost" size="icon-sm" onClick={doDeleteTask}>
                  <TrashIcon />
               </Button>
            </>
         )}
         {isEditing && (
            <>
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
