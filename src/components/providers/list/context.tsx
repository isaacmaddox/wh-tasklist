import type { List } from "@/lib/types";
import { createContext, type ActionDispatch } from "react";

export interface ListPageFilters {
   search?: string;
}

interface ListPageContextValue {
   list: List;
   updateName: (newName: List["name"]) => Promise<void>;
   doLiveUpdates: boolean;
   dispatchDoLiveUpdates: ActionDispatch<[enable: boolean]>;
   refreshList: () => void;
   doDeleteCompletedTasks: () => void;
   doAddTask: (name: string, due: string, flagged: boolean) => Promise<void>;
   filters: ListPageFilters;
   dispatchFilters: (edits: Partial<ListPageFilters>) => void;
   markTaskComplete: (taskId: string, completed: boolean) => Promise<void>;
}

export const ListPageContext = createContext<ListPageContextValue | undefined>(undefined);
