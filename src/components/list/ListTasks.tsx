import {
   DropdownMenu,
   DropdownMenuCheckboxItem,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuLabel,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { db } from "@/lib/firebase";
import { useSettings } from "@/lib/hooks/useSettings";
import { cn, formatDateForInput, getLocalDateFromInput, isTaskOverdue } from "@/lib/utils";
import type { Task } from "@/types";
import { push, ref } from "firebase/database";
import _ from "lodash";
import { FlagIcon, PlusIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useContext, useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ListPageContext } from "./ListPageProvider";
import { TaskItem } from "./TaskItem";

const inputClassName =
   "dark:scheme-dark text-base! p-0 px-1 leading-9 -mx-1 bg-transparent! shadow-none border-none focus:border-none rounded-sm";

type Filters = {
   query?: string;
   startDate?: number;
   endDate?: number;
   showFlagged?: boolean;
   showComplete?: boolean;
   showIncomplete?: boolean;
   showOverdue?: boolean;
   showDueSoon?: boolean;
};

export function ListTasks() {
   const ctx = useContext(ListPageContext);
   const newTaskInputRef = useRef<HTMLInputElement>(null);
   const { settings } = useSettings();
   const [newTaskName, setNewTaskName] = useState<string>("");
   const [newTaskDate, setNewTaskDate] = useState<string>("");
   const [newTaskFlagged, setNewTaskFlagged] = useState<boolean>(false);
   if (!ctx) throw new Error("Not in context");
   const { list, setList, doLiveUpdates, canUserModifyList } = ctx;
   if (!list) throw new Error("No list found");
   const [filters, dispatchFilters] = useReducer<Filters, [Filters | null]>((previous, action) => {
      if (action === null) {
         return {};
      }

      return {
         ...previous,
         ...action,
      };
   }, {});

   const tasks = _.orderBy(
      _.filter(Object.entries(list.tasks || {}), ([, task]) => {
         const wellFormedQuery = filters.query?.trim().toLowerCase() || "";
         if (wellFormedQuery !== "" && !task.name.toLowerCase().trim().includes(wellFormedQuery)) return false;

         if (filters.startDate !== undefined && task.due_date < filters.startDate) return false;
         if (filters.endDate !== undefined && task.due_date > filters.endDate) return false;

         const areAnyFiltersChecked = Object.values(filters).some((v) => v === true);

         if (areAnyFiltersChecked) {
            if (filters.showIncomplete && task.completed) return false;
            if (filters.showComplete && !task.completed) return false;

            if (filters.showFlagged && !task.flagged) return false;

            if (filters.showOverdue && !isTaskOverdue(task)) return false;
            if (
               filters.showDueSoon &&
               (isTaskOverdue(task) ||
                  !isTaskOverdue({
                     ...task,
                     due_date: task.due_date - 86400000 * (settings.function?.soonDays || 3),
                  }))
            )
               return false;
         }

         return true;
      }),
      [([, t]) => new Date(t.due_date)],
      "asc",
   );

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
         flagged: newTaskFlagged,
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
         setNewTaskFlagged(false);

         newTaskInputRef?.current?.focus();
      } catch {
         toast.error("You cannot add tasks to this list");
      }
   }

   return (
      <ul className="grid grid-cols-[max-content_1fr_max-content_min-content_min-content_min-content] gap-y-4 gap-3 task-list">
         <li className="search-row grid grid-cols-2 gap-4 col-span-full items-center pt-4 border-t border-border">
            <Field className="max-md:col-span-full">
               <Label htmlFor="filter">Filter</Label>
               <InputGroup>
                  <InputGroupInput
                     id="filter"
                     type="text"
                     placeholder="Search for a task..."
                     value={filters.query ?? ""}
                     onChange={(e) => dispatchFilters({ query: e.currentTarget.value })}
                  />
                  <InputGroupAddon align="inline-end">
                     <InputGroupButton size="icon-xs" onClick={() => dispatchFilters({ query: undefined })}>
                        <XIcon />
                     </InputGroupButton>
                  </InputGroupAddon>
               </InputGroup>
            </Field>
            <div className="grid grid-cols-2 items-end max-md:col-span-full">
               <Field>
                  <Label htmlFor="startDate">From</Label>
                  <InputGroup className="col-span-2 rounded-tr-none rounded-br-none">
                     <InputGroupInput
                        className="dark:scheme-dark"
                        id="startDate"
                        type="date"
                        value={filters.startDate ? formatDateForInput(new Date(filters.startDate)) : ""}
                        onChange={(e) => dispatchFilters({ startDate: getLocalDateFromInput(e.currentTarget.value) })}
                     />
                  </InputGroup>
               </Field>
               <Field>
                  <Label htmlFor="endDate">To</Label>
                  <InputGroup className="col-span-2 rounded-tl-none rounded-bl-none">
                     <InputGroupInput
                        className="dark:scheme-dark"
                        id="endDate"
                        type="date"
                        value={filters.endDate ? formatDateForInput(new Date(filters.endDate)) : ""}
                        onChange={(e) => dispatchFilters({ endDate: getLocalDateFromInput(e.currentTarget.value) })}
                     />
                  </InputGroup>
               </Field>
            </div>
            <div className="col-span-2 grid grid-cols-[1fr_min-content] items-center">
               <Field className="w-fit justify-self-end">
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-fit">
                           <SlidersHorizontalIcon />
                           Advanced
                        </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent>
                        <DropdownMenuGroup>
                           <DropdownMenuLabel>Status</DropdownMenuLabel>
                           <DropdownMenuCheckboxItem
                              checked={filters.showIncomplete}
                              onCheckedChange={() => dispatchFilters({ showIncomplete: !filters.showIncomplete })}
                              onSelect={(e) => e.preventDefault()}>
                              Incomplete
                           </DropdownMenuCheckboxItem>
                           <DropdownMenuCheckboxItem
                              checked={filters.showComplete}
                              onCheckedChange={() => dispatchFilters({ showComplete: !filters.showComplete })}
                              onSelect={(e) => e.preventDefault()}>
                              Completed
                           </DropdownMenuCheckboxItem>
                           <DropdownMenuCheckboxItem
                              checked={filters.showFlagged}
                              onCheckedChange={() => dispatchFilters({ showFlagged: !filters.showFlagged })}
                              onSelect={(e) => e.preventDefault()}>
                              Flagged
                           </DropdownMenuCheckboxItem>
                        </DropdownMenuGroup>
                        <DropdownMenuGroup>
                           <DropdownMenuLabel>Due Date</DropdownMenuLabel>
                           <DropdownMenuCheckboxItem
                              checked={filters.showOverdue}
                              onCheckedChange={() => dispatchFilters({ showOverdue: !filters.showOverdue })}
                              onSelect={(e) => e.preventDefault()}>
                              Overdue
                           </DropdownMenuCheckboxItem>
                           <DropdownMenuCheckboxItem
                              checked={filters.showDueSoon}
                              onCheckedChange={() => dispatchFilters({ showDueSoon: !filters.showDueSoon })}
                              onSelect={(e) => e.preventDefault()}>
                              Due Soon
                           </DropdownMenuCheckboxItem>
                        </DropdownMenuGroup>
                     </DropdownMenuContent>
                  </DropdownMenu>
               </Field>
               <Button
                  variant="ghost-dim"
                  className="ml-2"
                  onClick={() => {
                     dispatchFilters(null);
                  }}>
                  Clear all
               </Button>
            </div>
         </li>
         <li
            className={cn(
               "tasks-header-row grid grid-cols-subgrid col-span-full items-center pb-4 border-b border-border",
            )}>
            <p className="text-base leading-none font-semibold col-span-2">Task</p>
            <p className="text-base leading-none font-semibold">Due Date</p>
         </li>
         {canUserModifyList && (
            <li className={cn("grid grid-cols-subgrid col-span-full items-center add-task-row")}>
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
               <Button size="sm" variant="ghost" onClick={() => setNewTaskFlagged(!newTaskFlagged)}>
                  <FlagIcon
                     className={
                        newTaskFlagged
                           ? "fill-yellow-600 dark:fill-yellow-200 stroke-yellow-600 dark:stroke-yellow-200"
                           : "fill-transparent"
                     }
                  />
               </Button>
               <Button size="sm" className="w-full col-span-2" onClick={doAddTask}>
                  <PlusIcon />
                  Add
               </Button>
            </li>
         )}
         {tasks.map(([taskId, task]) => {
            return <TaskItem key={taskId} taskId={taskId} defaultTask={task} />;
         })}
      </ul>
   );
}
