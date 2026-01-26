import type { List } from "@/lib/types";
import { createContext, type ActionDispatch } from "react";

interface ListPageContextValue {
   list: List;
   updateList: (edits: Partial<List>) => Promise<void>;
   dispatchDoLiveUpdates: ActionDispatch<[enable: boolean]>;
}

export const ListPageContext = createContext<ListPageContextValue | undefined>(undefined);
