import { isFirebasePermissionError } from "@/lib/utils";
import { set } from "firebase/database";
import { HomeIcon, PlayCircleIcon, RotateCw, TrashIcon, UsersIcon } from "lucide-react";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ListCollaboratorsModal } from "../modals/ListCollaborators";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { ListPageContext } from "./ListPageProvider";
import { ListTitle } from "./ListTitle";

export function ListHeader() {
  const ctx = useContext(ListPageContext);
  if (!ctx) throw new Error("Not in context");
  const { list, listRef, updateList, isListLoading, doLiveUpdates, user, dispatchLiveUpdates } = ctx;
  if (!list) return;
  const navigate = useNavigate();

  async function doDeleteList() {
    if (confirm(`Are you sure you want to delete ${list!.name}?`)) {
      const listName = list!.name;

      try {
        await set(listRef, null);
        toast.success(`${listName} has been deleted`);
        navigate("/");
      } catch (e) {
        if (isFirebasePermissionError(e)) {
          toast.error(`You are not allowed to delete this list`);
        } else {
          toast.error(`Couldn't delete ${listName}`);
        }
      }
    }
  }

  return (
    <header className="pb-6 border-b border-border grid justify-items-start gap-4">
      <Button variant="ghost" size="sm" className="not-hover:px-0 not-hover:text-muted-foreground" asChild>
        <Link to="/">
          <HomeIcon />
          Home
        </Link>
      </Button>
      <ListTitle />
      <ul className="flex items-center gap-2 w-full">
        <li>
          <Button variant={doLiveUpdates ? "default" : "secondary"} onClick={() => dispatchLiveUpdates(!doLiveUpdates)}>
            <PlayCircleIcon />
            Toggle live
          </Button>
        </li>
        {!doLiveUpdates && (
          <li>
            <Button
              variant="secondary"
              size="icon"
              className="starting:opacity-0 starting:-translate-x-8 transition-all"
              onClick={() => updateList()}>
              {isListLoading ? <Spinner /> : <RotateCw />}
            </Button>
          </li>
        )}
        <li className="ml-auto">
          <ListCollaboratorsModal>
            <Button variant="outline">
              <UsersIcon />
              Collaborators ({Object.values(list.shares || {}).filter((isCollaborator) => isCollaborator).length})
            </Button>
          </ListCollaboratorsModal>
        </li>
        {list.owner_id === user.uid && (
          <li>
            <Button variant="destructive" className="group/delete-button not-hover:gap-0" onClick={doDeleteList}>
              <TrashIcon />
              <span className="w-0 overflow-hidden transition-discrete transition-[width] [interpolate-size:allow-keywords] group-hover/delete-button:w-auto">
                Delete list
              </span>
            </Button>
          </li>
        )}
      </ul>
    </header>
  );
}
