import { db } from "@/lib/firebase";
import type { HandleErrorOptions, ServiceErrorType, ServiceReturnType } from "@/lib/services";
import type { List, Task, WithId } from "@/lib/types";
import { getLocalDateFromInput, isFirebasePermissionError } from "@/lib/utils";
import * as Sentry from "@sentry/react";
import { push, ref, set, update } from "firebase/database";

export class TaskService {
   private static instance: TaskService | null = null;

   public static getInstance() {
      if (this.instance === null) {
         this.instance = new TaskService();
      }

      return this.instance;
   }

   public async addTask({
      listId,
      name,
      due,
      flagged,
      completed,
   }: AddTaskArgs): Promise<ServiceReturnType<AddTaskArgs, { task: WithId<Task> }>> {
      const strippedName = name.trim();

      if (!strippedName || !due) {
         return {
            success: false,
            errors: {
               ...(!strippedName && { name: "Task must have a name" }),
               ...(!due && { due: "Task must have a due date" }),
            },
         };
      }

      const listTasksRef = ref(db, `lists/${listId}/tasks`);
      const newTask: Task = {
         name,
         due_date: getLocalDateFromInput(due),
         flagged,
         list_id: listId,
         completed: completed ?? false,
      };

      try {
         const newTaskRef = await push(listTasksRef, newTask);
         return { success: true, data: { task: { ...newTask, _id: newTaskRef.key || "" } } };
      } catch (e) {
         return this.handleError(e);
      }
   }

   public async markTaskComplete(listId: string, taskId: string, completed: boolean): Promise<ServiceReturnType> {
      const taskRef = ref(db, `lists/${listId}/tasks/${taskId}`);

      const updates: Partial<Task> = {
         completed,
      };

      try {
         await update(taskRef, updates);
         return { success: true };
      } catch (e) {
         return this.handleError(e);
      }
   }

   public async toggleTaskFlagged(listId: string, taskId: string, flagged: boolean): Promise<ServiceReturnType> {
      const taskRef = ref(db, `lists/${listId}/tasks/${taskId}`);

      const updates: Partial<Task> = {
         flagged,
      };

      try {
         await update(taskRef, updates);
         return { success: true };
      } catch (e) {
         return this.handleError(e);
      }
   }

   public async editTask(
      listId: string,
      taskId: string,
      edits: EditTaskArgs,
   ): Promise<ServiceReturnType<EditTaskArgs>> {
      const strippedName = edits.name.trim();

      if (!strippedName || !edits.due) {
         return {
            success: false,
            errors: {
               ...(!strippedName && { name: "Task must have a name" }),
               ...(!edits.due && { due: "Task must have a due date" }),
            },
         };
      }

      const taskRef = ref(db, `lists/${listId}/tasks/${taskId}`);

      const updates: Partial<Task> = {
         name: edits.name,
         due_date: getLocalDateFromInput(edits.due),
      };

      try {
         await update(taskRef, updates);
         return { success: true };
      } catch (e) {
         return this.handleError(e);
      }
   }

   public async deleteCompletedTasks(list: List): Promise<ServiceReturnType<unknown, { tasks: Record<string, Task> }>> {
      const remaining: Record<string, Task> = { ...list.tasks };
      const completed: Record<string, null> = {};

      for (const [taskId, task] of Object.entries(list.tasks || {})) {
         if (task.completed) {
            completed[taskId] = null;
            delete remaining[taskId];
         }
      }

      const listTasksRef = ref(db, `lists/${list.id}/tasks`);

      try {
         await update(listTasksRef, completed);
         return { success: true, data: { tasks: remaining } };
      } catch (e) {
         return this.handleError(e);
      }
   }

   public async deleteTask(listId: string, taskId: string): Promise<ServiceReturnType> {
      const taskRef = ref(db, `lists/${listId}/tasks/${taskId}`);

      try {
         await set(taskRef, null);
         return { success: true };
      } catch (e) {
         return this.handleError(e);
      }
   }

   private handleError(error: unknown, options?: HandleErrorOptions): ServiceErrorType<unknown> {
      if (import.meta.env.VITE_ENV !== "development")
         Sentry.captureMessage(options?.message || `An error occurred`, {
            level: options?.severity || "error",
            extra: {
               error,
            },
         });

      if (isFirebasePermissionError(error)) {
         console.error(error);

         return {
            success: false,
            errors: {
               general: options?.permissionErrorMessage || "You are not allowed to do this",
            },
         };
      }

      return {
         success: false,
         errors: {
            general: "An error occurred",
         },
      };
   }
}

interface AddTaskArgs {
   listId: string;
   name: string;
   due: string;
   flagged: boolean;
   completed?: boolean;
}

interface EditTaskArgs {
   name: string;
   due: string;
}
