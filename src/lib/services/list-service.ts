import { db } from "@/lib/firebase";
import type { List } from "@/lib/types";
import { transformEmailToDatabase } from "@/lib/utils";
import { equalTo, get, onValue, orderByChild, query, ref } from "firebase/database";

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
}
