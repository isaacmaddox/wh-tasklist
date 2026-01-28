import { LoadingPage } from "@/components/loading-page";
import { ListPageContext, type ListPageFilters } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import { ListService } from "@/lib/services/list-service";
import { TaskService } from "@/lib/services/task-service";
import type { List } from "@/lib/types";
import { formatDateForInput, getLocalDateFromInput } from "@/lib/utils";
import { useCallback, useEffect, useReducer, useState, type PropsWithChildren } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ListPageProviderProps extends PropsWithChildren {
   listId?: string;
}

export function ListPageProvider({ listId, children }: ListPageProviderProps) {
   const [list, setList] = useState<List | null>(null);
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [doLiveUpdates, dispatchDoLiveUpdates] = useReducer(liveUpdatesReducer, initialLiveUpdatesPreference);
   const [filters, dispatchFilters] = useReducer(filtersReducerFactory(list?.id), {});
   const navigate = useNavigate();

   const listService = ListService.getInstance();
   const taskService = TaskService.getInstance();

   async function updateName(newName: List["name"]) {
      if (!list) return;

      const { errors } = await listService.editList(list.id, { name: newName });

      if (errors) {
         if (errors.general) toast.error(errors.general);
         return;
      }

      if (!doLiveUpdates) {
         setList((oldList) => {
            if (!oldList) return oldList;
            return {
               ...oldList,
               name: newName,
            };
         });
      }
   }

   async function doDeleteList() {
      if (!list) return;

      const { errors } = await listService.deleteList(list.id);

      if (errors) {
         if (errors.general) toast.error(errors.general);
         return;
      }

      navigate("/");
   }

   async function doDeleteCompletedTasks() {
      if (!list) return;

      const { success, errors, data } = await taskService.deleteCompletedTasks(list);

      if (!success) {
         if (errors?.general) toast.error(errors.general);
         return;
      }

      if (!doLiveUpdates) {
         setList((oldList) => {
            if (!oldList) return oldList;
            return {
               ...oldList,
               tasks: data.tasks,
            };
         });
      }
   }

   async function doAddTask(name: string, due: string, flagged: boolean, completed?: boolean) {
      if (!list) return;

      const { success, errors, data } = await taskService.addTask({
         listId: list.id,
         name,
         due,
         flagged,
         completed,
      });

      if (!success) {
         for (const message of Object.values(errors || {})) {
            toast.error(message);
            return;
         }
      }

      if (!doLiveUpdates) {
         setList((oldList) => {
            if (!oldList || !data) return oldList;
            return {
               ...oldList,
               tasks: {
                  ...oldList.tasks,
                  [data.task._id]: data?.task,
               },
            };
         });
      }
   }

   async function doEditTask(taskId: string, name: string, due: string) {
      if (!list) return;

      const { errors } = await taskService.editTask(list.id, taskId, {
         name,
         due,
      });

      if (errors) {
         for (const error of Object.values(errors)) {
            toast.error(error);
            return;
         }
      }

      if (!doLiveUpdates) {
         setList((oldList) => {
            if (!oldList || !oldList.tasks) return oldList;
            return {
               ...oldList,
               tasks: {
                  ...oldList.tasks,
                  [taskId]: {
                     ...oldList.tasks[taskId],
                     name,
                     due: getLocalDateFromInput(due),
                  },
               },
            };
         });
      }
   }

   async function markTaskComplete(taskId: string, completed: boolean) {
      if (!list) return;

      const { errors } = await taskService.markTaskComplete(list?.id, taskId, completed);

      if (errors) {
         toast.error(errors.general || "Something went wrong");
         return;
      }

      if (!doLiveUpdates) {
         setList((oldList) => {
            if (!oldList || !oldList.tasks) return oldList;
            return {
               ...oldList,
               tasks: {
                  ...oldList.tasks,
                  [taskId]: {
                     ...oldList.tasks[taskId],
                     completed,
                  },
               },
            };
         });
      }
   }

   async function doToggleFlag(taskId: string, flagged: boolean) {
      if (!list) return;

      const { errors } = await taskService.toggleTaskFlagged(list.id, taskId, flagged);

      if (errors) {
         if (errors.general) toast.error(errors.general);
         return;
      }

      if (!doLiveUpdates) {
         setList((oldList) => {
            if (!oldList || !oldList.tasks) return oldList;
            return {
               ...oldList,
               tasks: {
                  ...oldList.tasks,
                  [taskId]: {
                     ...oldList.tasks[taskId],
                     flagged,
                  },
               },
            };
         });
      }
   }

   async function doDeleteTask(taskId: string) {
      if (!list || !list.tasks) return;
      const task = { ...list.tasks[taskId] };

      const { errors } = await taskService.deleteTask(list.id, taskId);

      if (errors) {
         if (errors.general) toast.error(errors.general);
         return;
      }

      toast.success("Successfully deleted task", {
         action: {
            label: "Undo",
            onClick: () => {
               doAddTask(task.name, formatDateForInput(new Date(task.due_date)), !!task.flagged, task.completed);
            },
         },
      });

      if (!doLiveUpdates) {
         setList((oldList) => {
            if (!oldList) return oldList;
            const modifiedTasks = { ...oldList.tasks };
            delete modifiedTasks[taskId];
            return {
               ...oldList,
               tasks: modifiedTasks,
            };
         });
      }
   }

   const refreshList = useCallback(() => {
      listService
         .getById(listId)
         .then(setList)
         .finally(() => {
            toast.info("Refreshed list");
         });
   }, [listService, listId]);

   useEffect(() => {
      if (!doLiveUpdates) {
         listService
            .getById(listId)
            .then(setList)
            .finally(() => setIsLoading(false));
      } else if (listId) {
         return listService.addChangeListener(listId, (l) => {
            setList(l);
            setIsLoading(false);
         });
      }
   }, [listService, listId, doLiveUpdates]);

   useEffect(() => {
      const initialFilters = list ? JSON.parse(localStorage.getItem(`filters-${list.id}`) ?? "{}") : {};
      dispatchFilters(initialFilters);
   }, [list]);

   if (isLoading) {
      return <LoadingPage />;
   }

   if (list === null) {
      return (
         <div className="grid gap-3 justify-items-start">
            <p>This list doesn't exist or was deleted by its owner.</p>
            <Button variant="secondary" asChild>
               <Link to="/">Go home</Link>
            </Button>
         </div>
      );
   }

   return (
      <ListPageContext.Provider
         value={{
            list,
            refreshList,
            updateName,
            doDeleteList,
            doLiveUpdates,
            dispatchDoLiveUpdates,
            doDeleteCompletedTasks,
            doAddTask,
            doEditTask,
            doToggleFlag,
            doDeleteTask,
            filters,
            dispatchFilters,
            markTaskComplete,
         }}>
         {children}
      </ListPageContext.Provider>
   );
}

function liveUpdatesReducer(_: unknown, enable: boolean) {
   localStorage.setItem("live-updates", enable ? "true" : "false");
   return enable;
}

const initialLiveUpdatesPreference = (localStorage.getItem("live-updates") ?? "true") === "true";

function filtersReducerFactory(listId?: string) {
   return function filtersReducer(lastFilters: ListPageFilters, edits: Partial<ListPageFilters>) {
      const newFilters = { ...lastFilters, ...edits };
      if (listId) localStorage.setItem(`filters-${listId}`, JSON.stringify(newFilters));
      return newFilters;
   };
}
