import type { List } from "@/lib/types";
import { createContext, type ActionDispatch } from "react";

export interface ListPageFilters {
   search?: string;
   startDate?: number;
   endDate?: number;
   showIncomplete?: boolean;
   showComplete?: boolean;
   showFlagged?: boolean;
   showOverdue?: boolean;
   showDueSoon?: boolean;
}

interface ListPageContextValue {
   list: List;
   updateName: (newName: List["name"]) => Promise<void>;
   doDeleteList: () => Promise<void>;
   doAddCollaborator: (email: string) => Promise<void>;
   doRemoveCollaborator: (email: string, permanent?: boolean) => Promise<void>;
   doLiveUpdates: boolean;
   dispatchDoLiveUpdates: ActionDispatch<[enable: boolean]>;
   refreshList: () => void;
   doDeleteCompletedTasks: () => void;
   doAddTask: (name: string, due: string, flagged: boolean) => Promise<void>;
   doEditTask: (taskId: string, name: string, due: string) => Promise<void>;
   doToggleFlag: (taskId: string, flagged: boolean) => Promise<void>;
   doDeleteTask: (taskId: string) => Promise<void>;
   filters: ListPageFilters;
   dispatchFilters: (edits: Partial<ListPageFilters> | null) => void;
   markTaskComplete: (taskId: string, completed: boolean) => Promise<void>;
}

export const ListPageContext = createContext<ListPageContextValue | undefined>(undefined);
