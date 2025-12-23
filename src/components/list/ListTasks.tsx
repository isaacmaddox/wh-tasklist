import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { db } from "@/lib/firebase";
import { useSettings } from "@/lib/hooks/useSettings";
import { cn, getLocalDateFromInput } from "@/lib/utils";
import type { Task } from "@/types";
import { push, ref } from "firebase/database";
import _ from "lodash";
import { PlusIcon, XIcon } from "lucide-react";
import { useContext, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ListPageContext } from "./ListPageProvider";
import { TaskItem } from "./TaskItem";

const inputClassName = "dark:scheme-dark text-base! p-0 px-1 leading-9 -mx-1 bg-transparent! shadow-none border-none focus:border-none rounded-sm";

export function ListTasks() {
  const ctx = useContext(ListPageContext);
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [newTaskName, setNewTaskName] = useState<string>("");
  const [newTaskDate, setNewTaskDate] = useState<string>("");
  const { settings } = useSettings();
  if (!ctx) return;
  const { list, setList, doLiveUpdates, canUserModifyList } = ctx;
  if (!list) return;
  const filterStartDate = startDate !== "" ? getLocalDateFromInput(startDate) : undefined;
  const filterEndDate = endDate !== "" ? getLocalDateFromInput(endDate) : undefined;

  const tasks = _.orderBy(
    _.filter(Object.entries(list.tasks || {}), ([, task]) => {
      const wellFormedQuery = filterQuery.trim().toLowerCase();

      if (wellFormedQuery !== "" && !task.name.toLowerCase().trim().includes(wellFormedQuery)) return false;

      if (filterStartDate !== undefined && task.due_date < filterStartDate) return false;
      if (filterEndDate !== undefined && task.due_date > filterEndDate) return false;

      return true;
    }),
    [([, t]) => new Date(t.due_date)],
    "asc"
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
    <ul
      className={cn(
        "grid grid-cols-[max-content_1fr_max-content_min-content_min-content_min-content] gap-3 task-list",
        settings.appearance?.separateTasks !== "none" ? "gap-y-2" : "gap-y-4"
      )}>
      <li className="search-row grid grid-cols-2 gap-4 col-span-full items-center pt-4 border-t border-border">
        <Field className="max-md:col-span-full">
          <Label htmlFor="filter">Filter</Label>
          <InputGroup>
            <InputGroupInput
              id="filter"
              type="text"
              placeholder="Search for a task..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.currentTarget.value)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" onClick={() => setFilterQuery("")}>
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <div className="grid grid-cols-[1fr_1fr_min-content] items-end max-md:col-span-full">
          <Field>
            <Label htmlFor="startDate">From</Label>
            <InputGroup className="col-span-2 rounded-tr-none rounded-br-none">
              <InputGroupInput
                className="dark:scheme-dark"
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.currentTarget.value)}
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
                value={endDate}
                onChange={(e) => setEndDate(e.currentTarget.value)}
              />
            </InputGroup>
          </Field>
          <Button
            variant="ghost-dim"
            className="ml-2"
            onClick={() => {
              setFilterQuery("");
              setStartDate("");
              setEndDate("");
            }}>
            Clear all
          </Button>
        </div>
      </li>
      <li
        className={cn(
          "tasks-header-row grid grid-cols-subgrid col-span-full items-center pb-4 border-b border-border",
          settings.appearance?.separateTasks !== "none" && "pt-2"
        )}>
        <p className="text-base leading-none font-semibold col-span-2">Task</p>
        <p className="text-base leading-none font-semibold">Due Date</p>
      </li>
      {canUserModifyList && (
        <li
          className={cn(
            "grid grid-cols-subgrid col-span-full items-center border-b border-transparent add-task-row",
            settings.appearance?.separateTasks !== "none" && `py-2 border-border/50 border-${settings.appearance?.separateTasks}`
          )}>
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
          <Button size="sm" className="w-full col-span-3" onClick={doAddTask}>
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
