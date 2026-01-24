import type { List } from "@/lib/types";
import { createContext } from "react";

interface ListPageContextValue {
   list: List;
   setList: React.Dispatch<React.SetStateAction<List | null>>;
}

export const ListPageContext = createContext<ListPageContextValue | undefined>(undefined);
