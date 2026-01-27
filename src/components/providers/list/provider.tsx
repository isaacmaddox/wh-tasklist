import { LoadingPage } from "@/components/loading-page";
import { ListPageContext, type ListPageFilters } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import { ListService } from "@/lib/services/list-service";
import { TaskService } from "@/lib/services/task-service";
import type { List } from "@/lib/types";
import { useCallback, useEffect, useReducer, useState, type PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface ListPageProviderProps extends PropsWithChildren {
   listId?: string;
}

function liveUpdatesReducer(_: unknown, enable: boolean) {
   localStorage.setItem("live-updates", enable ? "true" : "false");
   return enable;
}

const initialLiveUpdatesPreference = (localStorage.getItem("live-updates") ?? "true") === "true";

function filtersReducer(lastFilters: ListPageFilters, edits: Partial<ListPageFilters>) {
   const newFilters = { ...lastFilters, ...edits };
   localStorage.setItem("filters", JSON.stringify(newFilters));
   return newFilters;
}

const initialFilters = JSON.parse(localStorage.getItem("filters") ?? "{}");

export function ListPageProvider({ listId, children }: ListPageProviderProps) {
   const [list, setList] = useState<List | null>(null);
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [doLiveUpdates, dispatchDoLiveUpdates] = useReducer(liveUpdatesReducer, initialLiveUpdatesPreference);
   const [filters, dispatchFilters] = useReducer(filtersReducer, initialFilters);

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

   async function doAddTask(name: string, due: string, flagged: boolean) {
      if (!list) return;

      const { success, errors, data } = await taskService.addTask({
         listId: list.id,
         name,
         due,
         flagged,
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

   const refreshList = useCallback(() => {
      listService
         .getById(listId)
         .then(setList)
         .finally(() => {
            toast.info("Refreshed list");
         });
   }, [listService, listId]);

   useEffect(() => {
      const service = ListService.getInstance();

      if (!doLiveUpdates) {
         service
            .getById(listId)
            .then(setList)
            .finally(() => setIsLoading(false));
      } else if (listId) {
         return service.addChangeListener(listId, (l) => {
            setList(l);
            setIsLoading(false);
         });
      }
   }, [listId, doLiveUpdates]);

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
            doLiveUpdates,
            dispatchDoLiveUpdates,
            doDeleteCompletedTasks,
            doAddTask,
            filters,
            dispatchFilters,
            markTaskComplete,
         }}>
         {children}
      </ListPageContext.Provider>
   );
}
