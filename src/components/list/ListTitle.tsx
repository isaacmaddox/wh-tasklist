import { cn } from "@/lib/utils";
import { update } from "firebase/database";
import { EditIcon } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ListPageContext } from "./ListPageProvider";

export function ListTitle() {
  const ctx = useContext(ListPageContext);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  if (!ctx) throw new Error("Not in context");
  const { list, listRef, setList, doLiveUpdates, user } = ctx;
  if (!list) return;

  async function doUpdateList(name: string, undone: boolean = false) {
    const oldName = list!.name;
    const newName = name.trim();
    if (newName === "") return;

    await update(listRef, {
      name: newName,
    });

    if (!doLiveUpdates) {
      setList((l) => ({
        ...l!,
        name: newName,
      }));
    }

    setIsEditing(false);
    if (!undone) {
      toast.success("Successfully renamed list", {
        action: {
          label: "Undo",
          onClick: () => doUpdateList(oldName, true),
        },
      });
    }
  }

  return (
    <div className={cn("w-full", isEditing && "grid gap-2 justify-items-start")}>
      {isEditing && (
        <Textarea
          className="w-full h-fit min-h-min leading-snug overflow-hidden p-0 bg-transparent! border-none text-3xl! resize-none rounded-sm field-sizing-content focus:border-none focus:ring-offset-8 focus:ring-offset-background font-bold"
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          defaultValue={list.name}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              doUpdateList(e.currentTarget.value);
            }
          }}
          onBlur={() => setIsEditing(false)}
        />
      )}
      {!isEditing && (
        <h1
          className="text-3xl w-fit font-bold inline leading-snug align-middle"
          contentEditable={isEditing}
          onClick={() => setIsEditing(list.owner_id === user.uid)}>
          {list.name}
        </h1>
      )}
      {!isEditing && list.owner_id === user.uid && (
        <Button className="ml-2 transition-colors inline-flex align-middle" size="icon-sm" variant="ghost" onClick={() => setIsEditing(true)}>
          <EditIcon />
        </Button>
      )}
    </div>
  );
}
