import { LoadingPage } from "@/components/loading-page";
import { ListPageContext, type ListPageFilters } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import type { ServiceErrorType } from "@/lib/services";
import { ListService } from "@/lib/services/list-service";
import { TaskService } from "@/lib/services/task-service";
import type { List } from "@/lib/types";
import {
   formatDateForInput,
   getLocalDateFromInput,
   transformEmailFromDatabase,
   transformEmailToDatabase,
} from "@/lib/utils";
import { useCallback, useEffect, useReducer, useState, type PropsWithChildren } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ListPageProviderProps extends PropsWithChildren {
   listId?: string;
}

type DeepPartial<T> = T extends object
   ? {
        [P in keyof T]?: DeepPartial<T[P]>;
     }
   : T;

export function ListPageProvider({ listId, children }: ListPageProviderProps) {
   const [list, setList] = useState<List | null>(null);
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [doLiveUpdates, dispatchDoLiveUpdates] = useReducer(liveUpdatesReducer, initialLiveUpdatesPreference);
   const [filters, dispatchFilters] = useReducer(filtersReducerFactory(list?.id), {});
   const navigate = useNavigate();

   const listService = ListService.getInstance();
   const taskService = TaskService.getInstance();

   function updateNested(obj: Record<string, unknown>, edits: Partial<Record<keyof List, unknown>>) {
      for (const [key, value] of Object.entries(edits)) {
         if (typeof value !== "object") {
            if (value === undefined) delete obj[key];
            else obj[key] = value;
         } else {
            if (!obj[key]) obj[key] = {};
            // @ts-expect-error Not sure how to fix this typing
            updateNested(obj[key], edits[key]);
         }
      }
   }

   function updateList(edits: DeepPartial<List>) {
      // Have to make a new clone to ensure that no memory references are held
      const listClone = structuredClone(list);

      if (list) {
         const modList = { ...list };
         updateNested(modList, edits);
         setList(modList);
      }

      return () => {
         setList(listClone);
      };
   }

   function toastError(errors: ServiceErrorType["errors"]) {
      for (const message of Object.values(errors || {})) {
         toast.error(message);
         return;
      }
   }

   async function updateName(newName: List["name"]) {
      if (!list) return;

      const rollback = updateList({
         name: newName,
      });

      const { success, errors } = await listService.editList(list.id, { name: newName });

      if (!success) {
         rollback();
         toastError(errors);
         return;
      }

      toast.success("Successfully renamed list");
   }

   async function doDeleteList() {
      if (!list) return;

      const { success, errors } = await listService.deleteList(list.id);

      if (!success) {
         toastError(errors);
         return;
      }

      navigate("/");
      toast.success("Successfully deleted list");
   }

   async function doAddCollaborator(email: string) {
      if (!list) return;

      const rollback = updateList({
         shares: {
            [transformEmailToDatabase(email)]: true,
         },
      });

      const { success, errors } = await listService.addCollaborator({
         listId: list.id,
         email,
      });

      if (!success) {
         rollback();
         toastError(errors);
         return;
      }

      toast.success(`Successfully added ${email} as a collaborator`);
   }

   async function doRemoveCollaborator(dbEmail: string, permanent?: boolean) {
      if (!list) return;

      const rollback = updateList({
         shares: {
            [transformEmailToDatabase(dbEmail)]: permanent ? undefined : false,
         },
      });

      const { success, errors } = await listService.removeCollaborator({
         listId: list.id,
         dbEmail,
         permanent: permanent || false,
      });

      if (!success) {
         rollback();
         toastError(errors);
         return;
      }

      toast.success(`Successfully removed ${transformEmailFromDatabase(dbEmail)} from collaborators list`);
   }

   async function doDeleteCompletedTasks() {
      if (!list) return;

      const { success, errors, data } = await taskService.deleteCompletedTasks(list);

      if (!success) {
         if (errors?.general) toast.error(errors.general);
         return;
      }

      toast.success("Successfully deleted completed tasks");

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
      if (!name || !due) {
         toast.error("Tasks must have a name and due date");
         return;
      }

      const rollback = updateList({
         tasks: {
            tmp: {
               list_id: list.id,
               name,
               due_date: getLocalDateFromInput(due),
               flagged,
               completed,
            },
         },
      });

      const { success, errors, data } = await taskService.addTask({
         listId: list.id,
         name,
         due,
         flagged,
         completed,
      });

      if (!success) {
         rollback();
         toastError(errors);
         return;
      }

      if (!doLiveUpdates) {
         updateList({
            tasks: {
               tmp: undefined,
               [data.task._id]: data.task,
            },
         });
      }
   }

   async function doEditTask(taskId: string, name: string, due: string) {
      if (!list) return;

      const rollback = updateList({
         tasks: {
            [taskId]: {
               name,
               due_date: getLocalDateFromInput(due),
            },
         },
      });

      const { success, errors } = await taskService.editTask(list.id, taskId, {
         name,
         due,
      });

      if (!success) {
         rollback();
         toastError(errors);
      }
   }

   async function markTaskComplete(taskId: string, completed: boolean) {
      if (!list || !list.tasks) return;

      const rollback = updateList({
         tasks: {
            [taskId]: {
               completed,
            },
         },
      });

      const { success, errors } = await taskService.markTaskComplete(list?.id, taskId, completed);

      if (!success) {
         rollback();
         toastError(errors);
      }
   }

   async function doToggleFlag(taskId: string, flagged: boolean) {
      if (!list) return;

      const rollback = updateList({
         tasks: {
            [taskId]: {
               flagged,
            },
         },
      });

      const { success, errors } = await taskService.toggleTaskFlagged(list.id, taskId, flagged);

      if (!success) {
         rollback();
         toastError(errors);
         return;
      }

      toast.success(`Successfully ${flagged ? "flagged" : "removed flag from"} task`);
   }

   async function doDeleteTask(taskId: string) {
      if (!list || !list.tasks) return;
      const task = { ...list.tasks?.[taskId] };

      const rollback = updateList({
         tasks: {
            [taskId]: undefined,
         },
      });

      const { success, errors } = await taskService.deleteTask(list.id, taskId);

      if (!success) {
         rollback();
         toastError(errors);
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
            doAddCollaborator,
            doRemoveCollaborator,
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
   return function filtersReducer(lastFilters: ListPageFilters, edits: Partial<ListPageFilters> | null) {
      const newFilters = edits !== null ? { ...lastFilters, ...edits } : {};
      if (listId) localStorage.setItem(`filters-${listId}`, JSON.stringify(newFilters));
      return newFilters;
   };
}
