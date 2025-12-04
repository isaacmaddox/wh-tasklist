import { auth } from "@/lib/firebase";
import type { List } from "@/types";
import type { User } from "firebase/auth";
import { get, type DatabaseReference, type DataSnapshot } from "firebase/database";
import { createContext, use, useCallback, useReducer, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "sonner";

interface ListPageContextValue {
  listRef: DatabaseReference;
  list: List | null;
  setList: React.Dispatch<React.SetStateAction<List | null>>;
  updateList: () => void;
  isListLoading: boolean;
  isAccessible: boolean;
  setIsAccessible: React.Dispatch<React.SetStateAction<boolean>>;
  doLiveUpdates: boolean;
  dispatchLiveUpdates: React.ActionDispatch<[enable: boolean]>;
  user: User;
  canUserModifyList: boolean;
}

export const ListPageContext = createContext<ListPageContextValue | undefined>(undefined);

interface ListPageProviderProps extends React.PropsWithChildren {
  listRef: DatabaseReference;
  listPromise: Promise<DataSnapshot>;
}

export function ListPageProvider({ listRef, listPromise, children }: ListPageProviderProps) {
  const listResult = use(listPromise);
  const [isListLoading, setIsListLoading] = useState<boolean>(false);
  const [list, setList] = useState<List | null>(listResult.val());
  const [isAccessible, setIsAccessible] = useState<boolean>(!list?.password_protected || false);
  const [user] = useAuthState(auth);
  const [doLiveUpdates, dispatchLiveUpdates] = useReducer((_, enable: boolean) => {
    localStorage.setItem("live-updates", enable ? "true" : "false");
    return enable;
  }, (localStorage.getItem("live-updates") || "true") === "true");
  if (!user) return;
  const canUserModifyList =
    list !== null &&
    (list.owner_id === user.uid || (list.shares !== undefined && user.email !== null && list.shares[user.email.replaceAll(".", ",")] === true));

  const updateList = useCallback(async () => {
    setIsListLoading(true);
    const updatedList = await get(listRef);
    setList(updatedList.val());
    setIsListLoading(false);
    toast.info("List refreshed");
  }, [listRef]);

  return (
    <ListPageContext.Provider
      value={{
        listRef,
        list,
        setList,
        updateList,
        isListLoading,
        isAccessible,
        setIsAccessible,
        doLiveUpdates,
        dispatchLiveUpdates,
        user,
        canUserModifyList,
      }}>
      {children}
    </ListPageContext.Provider>
  );
}
