import { db } from "@/lib/firebase";
import type { HandleErrorOptions, ServiceErrorType, ServiceReturnType } from "@/lib/services";
import type { List } from "@/lib/types";
import { isFirebasePermissionError, transformEmailToDatabase } from "@/lib/utils";
import * as Sentry from "@sentry/react";
import { equalTo, get, onValue, orderByChild, query, ref, set } from "firebase/database";

export class ListService {
   private static instance: ListService | null = null;

   public static getInstance() {
      if (this.instance === null) {
         this.instance = new ListService();
      }

      return this.instance;
   }

   public async getYourLists(userId: string): Promise<List[]> {
      const listsRef = ref(db, "/lists");
      const listsQuery = query(listsRef, orderByChild("owner_id"), equalTo(userId));

      const snapshot = await get(listsQuery);

      return Object.values(snapshot.val() || {});
   }

   public async getSharedLists(userEmail: string): Promise<List[]> {
      const listsRef = ref(db, "/lists");
      const listsQuery = query(listsRef, orderByChild(`shares/${transformEmailToDatabase(userEmail)}`), equalTo(true));

      return new Promise((resolve) => {
         onValue(
            listsQuery,
            (snapshot) => {
               resolve(Object.values(snapshot.val() || {}));
            },
            {
               onlyOnce: true,
            },
         );
      });
   }

   public async createList({
      userId,
      name,
   }: CreateListArgs): Promise<ServiceReturnType<CreateListArgs, { id: string }>> {
      const strippedName = name.trim();

      if (!strippedName) {
         return {
            success: false,
            errors: {
               name: "Please enter a name",
            },
         };
      }

      const newListId = crypto.randomUUID();
      const newListRef = ref(db, `lists/${newListId}`);

      const newListData: List = {
         id: newListId,
         owner_id: userId,
         name: strippedName,
      };

      try {
         await set(newListRef, newListData);
         return { success: true, data: { id: newListId } };
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

interface CreateListArgs {
   userId: string;
   name: string;
}
